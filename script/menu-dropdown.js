// &nbsp;&#9776;&nbsp;
// <img src="./smartify_100_100_trans.png"></img>

document.getElementById('div-menu-dropdown').innerHTML = 
`
<div class="dropdown" style="display:inline; vertical-align:super;">
    <button onclick="myFunction()" class="dropbtn" style="font-weight: bold; font-size: larger;">&nbsp;&#9776;&nbsp;</button>
    <div id="myDropdown" class="dropdown-content">
        <a href="index.html">Home</a>
        <a href="mint.html">Mint</a>
        <a href="hashtags.html">Hashtags</a>
        <a href="creators.html">Creators</a>
        <a href="items.html">Items</a>
        <a href="collectors.html">Collectors</a>
        <a href="collections.html">Collections</a>
        <a href="assets.html">Manage Items</a>
        <a href="transfer.html">Transfer</a>
        <a href="contract.html">Contract</a>
    </div>
</div>
&nbsp;
<h1 class="title">${document.getElementById('h1-title').innerHTML + TESTNET_MARKER}</h1>
`

function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}
  
// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
        }
    }
}