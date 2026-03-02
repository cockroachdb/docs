#!/usr/bin/env python3
"""
Smart Algolia Indexing Wrapper
- Auto-detects if full or incremental indexing should be used
- Handles state file management
- Perfect for CI/CD environments like TeamCity
- Provides comprehensive logging and error handling
"""

import os
import sys
import json
import subprocess
import pathlib
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
INDEXER_SCRIPT = "algolia_index_intelligent_bloat_removal.py"

def get_config():
    """Get configuration from environment variables (evaluated at runtime)."""
    STATE_DIR = os.environ.get("ALGOLIA_STATE_DIR", "/opt/teamcity-data/algolia_state")
    ENVIRONMENT = os.environ.get("ALGOLIA_INDEX_ENVIRONMENT", "staging")
    FORCE_FULL = os.environ.get("ALGOLIA_FORCE_FULL", "false").lower() == "true"
    INDEX_NAME = os.environ.get("ALGOLIA_INDEX_NAME", f"{ENVIRONMENT}_cockroach_docs")
    
    # Derived paths
    STATE_FILE = os.path.join(STATE_DIR, f"files_tracked_{ENVIRONMENT}.json")
    LOG_FILE = os.path.join(STATE_DIR, f"indexing_log_{ENVIRONMENT}.json")
    
    return {
        'STATE_DIR': STATE_DIR,
        'ENVIRONMENT': ENVIRONMENT,
        'FORCE_FULL': FORCE_FULL,
        'INDEX_NAME': INDEX_NAME,
        'STATE_FILE': STATE_FILE,
        'LOG_FILE': LOG_FILE
    }

class IndexingManager:
    """Manages the intelligent indexing workflow."""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.config = get_config()
        self.ensure_directories()
        
    def ensure_directories(self):
        """Create necessary directories."""
        os.makedirs(self.config['STATE_DIR'], exist_ok=True)
        print(f"📁 State directory: {self.config['STATE_DIR']}")
        print(f"📄 State file: {self.config['STATE_FILE']}")
        
    def should_do_full_index(self) -> tuple[bool, str]:
        """
        Decide whether to do full or incremental indexing.
        Returns: (should_do_full, reason)
        Priority order is important - higher priority checks come first.
        """
        
        # 1. Force full if explicitly requested (HIGHEST PRIORITY)
        if self.config['FORCE_FULL']:
            return True, "Forced full indexing via ALGOLIA_FORCE_FULL"
        
        # 2. Full if state file doesn't exist (SECOND HIGHEST)
        if not os.path.exists(self.config['STATE_FILE']):
            return True, "State file not found - first run or cleanup needed"
        
        # 3. Full if state file is corrupted (THIRD HIGHEST)
        try:
            with open(self.config['STATE_FILE'], 'r') as f:
                state_data = json.load(f)
                if not isinstance(state_data, dict) or len(state_data) == 0:
                    return True, "State file is empty or invalid"
        except (json.JSONDecodeError, IOError) as e:
            return True, f"State file corrupted: {e}"
        
        # 4. Full if state file is too old (older than 7 days) (FOURTH)
        state_age_days = (datetime.now().timestamp() - os.path.getmtime(self.config['STATE_FILE'])) / 86400
        if state_age_days > 7:
            return True, f"State file is {state_age_days:.1f} days old - doing full refresh"
        
        # 5. Check file count heuristic (BEFORE content changes for testing)
        try:
            with open(self.config['STATE_FILE'], 'r') as f:
                state_data = json.load(f)
                tracked_files = len(state_data)
                
                # If we tracked very few files last time, something might be wrong
                if tracked_files < 100:
                    return True, f"Too few files tracked last time ({tracked_files}) - likely incomplete indexing"
        except Exception:
            pass  # Already handled by corruption check above
        
        # 6. Full if significant content changes detected (LOWER PRIORITY)
        content_change_reason = self.detect_content_changes()
        if content_change_reason:
            return True, content_change_reason
        
        # 7. Otherwise, do incremental (DEFAULT)
        return False, "State file exists and is recent - using incremental mode"
    
    def detect_content_changes(self) -> Optional[str]:
        """
        Detect if there have been significant content changes since last indexing.
        This looks at source files and git commits, not the built _site directory.
        Returns reason string if significant changes detected, None otherwise.
        """
        
        # Method 1: Check git commits since last indexing
        try:
            state_mtime = os.path.getmtime(self.config['STATE_FILE'])
            last_index_time = datetime.fromtimestamp(state_mtime)
            
            # Get commits since last indexing
            git_cmd = [
                "git", "log", 
                f"--since={last_index_time.strftime('%Y-%m-%d %H:%M:%S')}", 
                "--oneline", 
                "--", 
                "src/", "*.md", "*.yml", "_config*.yml"  # Source files only
            ]
            
            result = subprocess.run(git_cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                commits = result.stdout.strip().split('\n') if result.stdout.strip() else []
                commits = [c for c in commits if c.strip()]  # Remove empty lines
                
                if len(commits) > 0:
                    return f"Git commits detected since last indexing: {len(commits)} commits affecting source files"
                    
        except Exception as e:
            print(f"⚠️ Could not check git commits: {e}")
        
        # Method 2: Check if major source files are newer than state file
        try:
            state_mtime = os.path.getmtime(self.config['STATE_FILE'])
            important_source_files = [
                "_config_cockroachdb.yml",
                "_data/versions.csv",
                "Gemfile",
                "Gemfile.lock"
            ]
            
            changed_config_files = []
            for source_file in important_source_files:
                if os.path.exists(source_file):
                    if os.path.getmtime(source_file) > state_mtime:
                        changed_config_files.append(source_file)
            
            if changed_config_files:
                return f"Configuration changes detected: {', '.join(changed_config_files)} modified since last indexing"
                
        except Exception as e:
            print(f"⚠️ Could not check source file timestamps: {e}")
        
        return None
    
    def run_indexing(self, is_full: bool, reason: str) -> bool:
        """Run the actual indexing process."""
        mode = "FULL" if is_full else "INCREMENTAL"
        
        print(f"\n🚀 STARTING {mode} INDEXING")
        print(f"   Reason: {reason}")
        print(f"   Index: {self.config['INDEX_NAME']}")
        print(f"   Time: {self.start_time.isoformat()}")
        
        # Set up environment
        env = os.environ.copy()
        env.update({
            "ALGOLIA_INCREMENTAL": "false" if is_full else "true",
            "ALGOLIA_TRACK_FILE": self.config['STATE_FILE'],
            "ALGOLIA_INDEX_NAME": self.config['INDEX_NAME']
        })
        
        # Required environment variables check
        required_vars = ["ALGOLIA_APP_ID", "ALGOLIA_ADMIN_API_KEY"]
        missing_vars = [var for var in required_vars if not env.get(var)]
        if missing_vars:
            print(f"❌ ERROR: Missing required environment variables: {missing_vars}")
            return False
        
        try:
            # Run the indexer
            print(f"\n📊 Executing: python3 {INDEXER_SCRIPT}")
            result = subprocess.run(
                ["python3", INDEXER_SCRIPT],
                env=env,
                capture_output=True,
                text=True,
                timeout=3600  # 1 hour timeout
            )
            
            # Print output in real-time style
            if result.stdout:
                print("📤 INDEXER OUTPUT:")
                print(result.stdout)
            
            if result.stderr:
                print("⚠️ INDEXER ERRORS:")
                print(result.stderr)
            
            success = result.returncode == 0
            
            if success:
                print(f"\n✅ {mode} INDEXING COMPLETED SUCCESSFULLY")
            else:
                print(f"\n❌ {mode} INDEXING FAILED")
                print(f"   Return code: {result.returncode}")
                
            return success
            
        except subprocess.TimeoutExpired:
            print(f"\n⏰ INDEXING TIMED OUT (1 hour limit)")
            return False
        except Exception as e:
            print(f"\n💥 UNEXPECTED ERROR: {e}")
            return False
    
    def log_run(self, is_full: bool, reason: str, success: bool, duration_seconds: float):
        """Log the indexing run for monitoring."""
        
        log_entry = {
            "timestamp": self.start_time.isoformat(),
            "environment": self.config['ENVIRONMENT'],
            "index_name": self.config['INDEX_NAME'],
            "mode": "FULL" if is_full else "INCREMENTAL",
            "reason": reason,
            "success": success,
            "duration_seconds": round(duration_seconds, 2),
            "state_file_exists": os.path.exists(self.config['STATE_FILE']),
            "state_file_size": os.path.getsize(self.config['STATE_FILE']) if os.path.exists(self.config['STATE_FILE']) else 0
        }
        
        # Load existing log
        logs = []
        if os.path.exists(self.config['LOG_FILE']):
            try:
                with open(self.config['LOG_FILE'], 'r') as f:
                    logs = json.load(f)
            except:
                logs = []
        
        # Add new entry and keep last 50 runs
        logs.append(log_entry)
        logs = logs[-50:]
        
        # Save log
        try:
            with open(self.config['LOG_FILE'], 'w') as f:
                json.dump(logs, f, indent=2)
        except Exception as e:
            print(f"⚠️ Could not save log: {e}")
    
    def print_summary(self, is_full: bool, reason: str, success: bool, duration_seconds: float):
        """Print a comprehensive summary."""
        
        print(f"\n" + "="*60)
        print(f"🎯 ALGOLIA INDEXING SUMMARY")
        print(f"="*60)
        print(f"Environment: {self.config['ENVIRONMENT']}")
        print(f"Index: {self.config['INDEX_NAME']}")
        print(f"Mode: {'FULL' if is_full else 'INCREMENTAL'}")
        print(f"Reason: {reason}")
        print(f"Result: {'✅ SUCCESS' if success else '❌ FAILED'}")
        print(f"Duration: {duration_seconds:.1f} seconds")
        print(f"State file: {self.config['STATE_FILE']}")
        print(f"State exists: {'Yes' if os.path.exists(self.config['STATE_FILE']) else 'No'}")
        
        if os.path.exists(self.config['STATE_FILE']):
            try:
                with open(self.config['STATE_FILE'], 'r') as f:
                    state_data = json.load(f)
                    print(f"Tracked files: {len(state_data)}")
            except:
                print(f"Tracked files: Unknown (file corrupted)")
        
        print(f"="*60)

def main():
    """Main wrapper function."""
    
    config = get_config()
    print(f"🎯 SMART ALGOLIA INDEXING WRAPPER")
    print(f"   Environment: {config['ENVIRONMENT']}")
    print(f"   Index: {config['INDEX_NAME']}")
    print(f"   State directory: {config['STATE_DIR']}")
    
    # Check if indexer script exists
    if not os.path.exists(INDEXER_SCRIPT):
        print(f"❌ ERROR: Indexer script not found: {INDEXER_SCRIPT}")
        print(f"   Current directory: {os.getcwd()}")
        print(f"   Available files: {list(pathlib.Path('.').glob('*.py'))}")
        sys.exit(1)
    
    manager = IndexingManager()
    
    # Decide on indexing mode
    is_full, reason = manager.should_do_full_index()
    
    print(f"\n🎯 INDEXING DECISION:")
    print(f"   Mode: {'FULL' if is_full else 'INCREMENTAL'}")
    print(f"   Reason: {reason}")
    
    # Run indexing
    success = manager.run_indexing(is_full, reason)
    
    # Calculate duration
    duration = (datetime.now() - manager.start_time).total_seconds()
    
    # Log the run
    manager.log_run(is_full, reason, success, duration)
    
    # Print summary
    manager.print_summary(is_full, reason, success, duration)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()