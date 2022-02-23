let isRunning = false;

async function showItems() {

    if (isRunning == false) {
        isRunning = true;

        await connectWallet();
        await switchNetwork();
        // console.log(connected0xAccount);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // console.log(`log: contract address set to ${smartifyContractAddress}`);

        const smartifyContract = new ethers.Contract(smartifyContractAddress, smartifyContractABI, provider);

        // connected0xAccount = '';
        const eventFilterReceived = smartifyContract.filters.Transfer(null, connected0xAccount, null);
        const eventsReceived = await smartifyContract.queryFilter(eventFilterReceived);
        // console.log(eventsReceived);

        const eventFilterSent = smartifyContract.filters.Transfer(connected0xAccount, null, null);
        const eventsSent = await smartifyContract.queryFilter(eventFilterSent);
        // console.log(eventsSent);

        let ownedCandidates = {};
        for (let i = 0; i < eventsReceived.length; i++){
            const tokenId = eventsReceived[i].args[2];
            ownedCandidates[String(tokenId)] = {};
            ownedCandidates[String(tokenId)]["blockNumber"] = eventsReceived[i].blockNumber;
            ownedCandidates[String(tokenId)]["owned"] = true;
            ownedCandidates[String(tokenId)]["ownedIndex"] = i;
        }
        for (let i = 0; i < eventsSent.length; i++){
            const tokenId = eventsSent[i].args[2];

            if ( eventsSent[i].blockNumber >= ownedCandidates[String(tokenId)]["blockNumber"]){
                ownedCandidates[String(tokenId)]["owned"] = false;
            }
        }
        // console.log(ownedCandidates);
        // console.log(Object.keys(ownedCandidates));

        let arrayTokenId = Object.keys(ownedCandidates);
        let ownedIndex = 0;

        document.getElementById('collection-and-owner').innerHTML = `<h4>Loading ITMS owned by ${connected0xAccount}... </h4>`;

        document.getElementById('list-of-nfts').innerHTML = '';
        for (let i = 0; i < arrayTokenId.length; i++) {
            if (ownedCandidates[String(arrayTokenId[i])]["owned"] === true) {

                ownedIndex++;
                const tokenURI = await smartifyContract.tokenURI(arrayTokenId[i]);
                // console.log(tokenURI);
                const nftJSON = await fetchJSON(tokenURI);
                // console.log(nftJSON);
                // console.log(nftJSON.name);
                // console.log(nftJSON.attributes[0]);
                // console.log(nftJSON.attributes[0]["value"]);

                document.getElementById('list-of-nfts').innerHTML +=
`<span class="nftdisplay">
    ITMS <a href="items.html?t=${arrayTokenId[i]}">#${arrayTokenId[i]}</a>
    <span class="imgbox">
        <img class="assets" onclick="imgToFullscreen('${nftJSON.image}')" src="${nftJSON.image}">
    </span>
    <a href="transfer.html?t=${arrayTokenId[i]}" title="Transfer">
        <img class="transfer-sign" src="./image/transfer-icon-neg.png">
    </a>
</span>`;

            }
        }

        document.getElementById('collection-and-owner').innerHTML = `<h4>ITMS owned by ${ethers.utils.getAddress(connected0xAccount.toString())}...&nbsp;&nbsp; ${ownedIndex} in total</h4>`;
        isRunning = false;
    }
}
