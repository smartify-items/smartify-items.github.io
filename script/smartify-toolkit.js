
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


async function scanEditions(){
    const tokenId = Number(document.getElementById('input-token-id-editions').value);

    const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
    const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

    const totalSupply = await smartifyContract.totalSupply();
    if ( tokenId > totalSupply || tokenId <= 0 ){
        alert('Invalid Token ID.');
        return 0;
    }

    // event CreateToken(
    //     uint256 indexed tokenId, 
    //     string indexed hashedIpfsCID, 
    //     address indexed createdBy, 
    //     uint16 editions, 
    //     string plainIpfsCID
    // );
    const eventFilter = smartifyContract.filters.CreateToken(tokenId);
    const events = await smartifyContract.queryFilter(eventFilter);
    // console.log(events[0].args[1]);
    // const hashedIpfsCID = events[0].args[1].hash
    const plainIpfsCID =  events[0].args[4];

    document.getElementById('div-editions').innerHTML = `
IPFS CIDv1: ${plainIpfsCID} is found in the following tokens: 
`;

    // console.log(tokenId + ': ' + hashedIpfsCID);
    

    // hashedIpfsCID = '0x998454156d19634ca30551bdc750679341e1e8079d8f9ac6e3bf458a97045450';
    const hashFilter = smartifyContract.filters.CreateToken(null, plainIpfsCID);
    const hashEvents = await smartifyContract.queryFilter(hashFilter);

    console.log(hashEvents);
    for (let i = 0; i < hashEvents.length; i++){
        document.getElementById('div-editions').innerHTML += 
`
ITMS #${hashEvents[i].args[0]} created by ${hashEvents[i].args[2]} (of ${hashEvents[i].args[3]} editions)`;
    }

}