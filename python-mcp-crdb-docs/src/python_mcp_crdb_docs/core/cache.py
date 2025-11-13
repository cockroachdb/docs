"""Simple TTL-aware LRU cache."""

from __future__ import annotations

import time
from collections import OrderedDict
from typing import Generic, Optional, TypeVar

K = TypeVar("K")
V = TypeVar("V")


class TTLCache(Generic[K, V]):
    def __init__(self, maxsize: int = 128, ttl: float = 60.0) -> None:
        self.maxsize = maxsize
        self.ttl = ttl
        self._data: "OrderedDict[K, tuple[float, V]]" = OrderedDict()

    def _purge(self) -> None:
        now = time.time()
        keys_to_delete = [key for key, (expires, _) in self._data.items() if expires < now]
        for key in keys_to_delete:
            self._data.pop(key, None)
        while len(self._data) > self.maxsize:
            self._data.popitem(last=False)

    def get(self, key: K) -> Optional[V]:
        self._purge()
        if key not in self._data:
            return None
        expires, value = self._data.pop(key)
        if expires < time.time():
            return None
        self._data[key] = (expires, value)
        return value

    def set(self, key: K, value: V) -> None:
        expires = time.time() + self.ttl
        self._data[key] = (expires, value)
        self._purge()

    def clear(self) -> None:
        self._data.clear()
