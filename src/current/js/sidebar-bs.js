const branches = document.querySelectorAll(".sidenav-branch");

function branchClassToggle() {
    let arrowMatch = this.firstElementChild;
    arrowMatch.classList.toggle("bi-chevron-right");
    arrowMatch.classList.toggle("bi-chevron-down");
}

for (let branch of branches) {
    branch.addEventListener("click", branchClassToggle);
}
