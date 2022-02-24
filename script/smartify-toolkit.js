
function parseHashtags(){
    const _inputHashtags = document.getElementById('nft-hashtags').value;

    let _hashtags = _inputHashtags.split(/[\s,]+/);
    _hashtags = _hashtags.map(s => s.trim());

    return _hashtags;
}


async function attachHashtagOnChain(){
    await connectWallet();
    await connectNetwork();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();
    const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer);

    const tokenId = document.getElementById('input-token-id').value;
    const hashtags = parseHashtags();
    let threeHashtags = ['', '', ''];

    let j = 0;
    for (let i = 0; i < hashtags.length; i++){
        if ( hashtags[i].match(/^\#.+/) ) {
            threeHashtags[j] = hashtags[i];
            j++;
        }
    }

    console.log(threeHashtags);

    try {
        const contractFunction = await smartifyContract.createTokenHashtags(
            tokenId, 
            hashtagToBytes32(threeHashtags[0]), 
            hashtagToBytes32(threeHashtags[1]), 
            hashtagToBytes32(threeHashtags[2]), 
            );
        const tx = await contractFunction.wait();
        const event = tx.events[0];
        console.log(event);
        
    } catch(e) {
        alert(e);
    }
    
}