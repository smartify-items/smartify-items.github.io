document.getElementById('api-key').value = getCookie("api-key");
document.getElementById('secret-api-key').value = getCookie("secret-api-key");

document.getElementById('button-for-file').addEventListener(
    'click', 
    () => {
        document.getElementById('file-to-smartify').click()
    }
);

function savePinataKeys(){
    setCookie("api-key", document.getElementById('api-key').value, 30);
    setCookie("secret-api-key", document.getElementById('secret-api-key').value, 30);
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    console.log(document.cookie);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function updateFile(){
    // console.log('file changed');
    if (document.getElementById('file-to-smartify').value != ''){
        document.getElementById('button-for-file').innerHTML = document.getElementById('file-to-smartify').files[0].name;
    } else {
        document.getElementById('button-for-file').innerHTML = 'Select File to Smartify';
    }
}


function showDiv(elementId){
    if (document.getElementById(elementId).style.display == 'block'){
        document.getElementById(elementId).style.display = 'none';
    } else {
        document.getElementById(elementId).style.display = 'block';
    }
}


// document.getElementById('nft-name').value = 'TEST';
// document.getElementById('nft-description').value = 
// `123
// 獨享豬腳很難瘦
// 簡稱獨腳瘦

// 實在想不到什麼好點子
// 找了年代久遠檔案照充數
// 而且還對焦失敗
// 這是海德堡的德國豬腳

// 空格  空格  空格
// `;
// document.getElementById('nft-hashtags').value = '#smartBCH, #ptt, test, #noise, #taiwan';



function goBack() {
    inPreview = false;

    document.documentElement.scrollTop = document.body.scrollTop = 0;
    
    console.log('inPreview: ' + inPreview);

    document.getElementById('div-preview').style.display = 'none';

    document.getElementById('button-preview').style.display = 'inline';
    document.getElementById('button-back').style.display = 'none';
    document.getElementById('button-smartify').style.display = 'none';

    document.getElementById('div-input').style.display = 'block';
}


// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
const mimeTypes = [
    'image/bmp', 
    'image/gif', 
    'image/jpeg', 
    'image/png', 
    // 'application/pdf', 
    'image/svg+xml', 
    'image/tiff'
];

let accountWeb3 = '';
let mimeType = '';
let inPreview = false;
let mintTo = '';

async function showPreview() {

    if ( document.getElementById('file-to-smartify').files[0] ){
        mimeType = document.getElementById('file-to-smartify').files[0].type;
        if ( mimeTypes.includes(mimeType) ) {
            console.log(mimeType);
        } else {
            alert(`File type ${mimeType} is not supported. For the time being please consider bmp, gif, jpeg, png, svg, tiff files.`);

            return 0;
        }

    } else {
        alert('Please select a file.');
        return 0;
    }

    if ( document.getElementById('nft-editions').value == '' ){
        document.getElementById('nft-editions').value = 1;
    }

    if ( document.getElementById('nft-royalties').value == '' ){
        document.getElementById('nft-royalties').value = 0;
    }

    await connectWallet();
    await connectNetwork();

    mintTo = document.getElementById('nft-recipient').value;
    if (mintTo == ''){
        mintTo = _CONNECTED_ACC_;
    } else {
        if ( ! ethers.utils.isAddress(mintTo) ){
            alert('Please check recipient address.');
            return 0;
        }
    }

    if ( ! (_IS_WALLET_CONNECTED_ && _IS_NETWORK_CONNECTED_) ) {
        // console.log('Please connect wallet to smartBCH network.');
        alert('Please connect wallet to the smartBCH network.');
        return 0;
    }

    // window.ethereum.request({ method: 'eth_requestAccounts' })
    // .then( ( result ) => { accountWeb3 = result} )

    inPreview = true;
    console.log('inPreview: ' + inPreview);

    // document.documentElement.scrollTop || document.body.scrollTop
    document.documentElement.scrollTop = document.body.scrollTop = 0;


    let previewContent = '';

    const hashtags = parseHashtags();
    // console.log(hashtags);

    previewContent = 
`
<div class="preview-image"><img class="preview" onclick="imgToFullscreen('${URL.createObjectURL(document.getElementById('file-to-smartify').files[0])}')" src="${URL.createObjectURL(document.getElementById('file-to-smartify').files[0])}"></div>


[ Creator ]
<div class="preview-fields">${_CONNECTED_ACC_}</div>

[ Title ]
<div class="preview-fields">${document.getElementById('nft-name').value}</div>

[ Description ]
<div class="preview-fields" style="text-align: justify">${document.getElementById('nft-description').value}</div>

[ Hashtags ]
<div class="preview-fields">`;

    for (let i = 0; i < hashtags.length; i++){
        if ( hashtags[i].match(/^\#.+/) ) {
            previewContent += hashtags[i];
            previewContent += "\r\n";
        }
    }

    previewContent += '</div>';
    previewContent += 
`

[ Editions ]
<div class="preview-fields">${document.getElementById('nft-editions').value}</div>

[ Royalties Suggeston ]
<div class="preview-fields">${document.getElementById('nft-royalties').value} %</div>

[ Pinata API Keys ]
<div class="preview-fields">${document.getElementById('api-key').value}</div>
<div class="preview-fields">${document.getElementById('secret-api-key').value}</div>

[ NFT Recipient ]
<div class="preview-fields">${mintTo}</div>

` 


    // previewContent += hashtags;

    document.getElementById('div-preview').innerHTML = previewContent;

    document.getElementById('div-input').style.display = 'none';

    document.getElementById('button-preview').style.display = 'none';
    document.getElementById('button-back').style.display = 'inline';
    document.getElementById('button-smartify').style.display = 'inline';

    document.getElementById('div-preview').style.display = 'block';
}


function parseHashtags(){
    const _inputHashtags = document.getElementById('nft-hashtags').value;

    let _hashtags = _inputHashtags.split(/[\s,]+/);
    _hashtags = _hashtags.map(s => s.trim());

    // console.log(hashtags);
    return _hashtags;
}



async function hashtagOnChain(){
    const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();
    const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer);

    const hashtags = parseHashtags();
    let threeHashtags = ['', '', ''];

    let j = 0;
    for (let i = 0; i < hashtags.length; i++){
        if ( hashtags[i].match(/^\#.+/) ) {
            threeHashtags[j] = hashtags[i];
            j++;
        }
    }

    try {
        const contractFunction = await smartifyContract.createTokenHashtags(
            firstTokenId, 
            hashtagToBytes32(threeHashtags[0]), 
            hashtagToBytes32(threeHashtags[1]), 
            hashtagToBytes32(threeHashtags[2]), 
            );
        const tx = await contractFunction.wait();
        const event = tx.events[0];
        console.log(event);

        document.getElementById('span-status').innerHTML += ' Hashtagged on-chain.';
        
    } catch(e) {
        alert(e);
    }
    
}



let isSmartifying = false;
let firstTokenId = 0;

async function smartify(){

    isSmartifying = true;

    // 

    document.getElementById('span-status').innerHTML = 'Uploading file to IPFS... <img src="./image/Spinner-1s-200px.png" style="max-height: 60px">';

    const fileIpfsHash = await pinFileToIPFS();
    console.log(fileIpfsHash);

    // 

    document.getElementById('span-status').innerHTML = 'Uploading metadata to IPFS... <img src="./image/Spinner-1s-200px.png" style="max-height: 60px">';

    const jsonIpfsHash = await pinJSONToIPFS(fileIpfsHash);
    console.log(jsonIpfsHash);
    
    // 

    // return[str.substr(0, 32), str_1, str.substr(32), str_2 + zeros.substr(0, zerosToPad)];
    const [part_1, part_2] = cidToBytes32(jsonIpfsHash);

    // 

    document.getElementById('span-status').innerHTML = 'Minting NFT on smartBCH... <img src="./image/Spinner-1s-200px.png" style="max-height: 60px">';

	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();
    const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer);

    const mintFee = await smartifyContract.mintFee();

    try {
        const contractFunction = await smartifyContract.createToken(
            document.getElementById('nft-editions').value, 
            mintTo, 
            part_1, 
            part_2, 
            document.getElementById('nft-royalties').value * 100,
            { value: BigInt(mintFee) * BigInt(document.getElementById('nft-editions').value) });

            const tx = await contractFunction.wait();
            const event = tx.events[0];
            console.log(event);
            firstTokenId = event.args[2].toNumber();
        
            document.getElementById('span-status').innerHTML = 'NFT(s) minted.';
            document.getElementById('button-hashtag').style.display = 'inline';
            document.getElementById('button-next-item').style.display = 'inline';
    } catch(e) {
        alert(e);
        return 0;
    }

    // 

    isSmartifying = false;    

}


// const hashtags = parseHashtags().map(s => `"${s}"`).join(", \r\n");
// console.log(hashtags);

async function pinJSONToIPFS(fileIpfsHash) {

    // const hashtags = parseHashtags().map(s => `"${s}"`).join(", \r\n");
    // const hashtags = parseHashtags().join(", ");
    const hashtags = parseHashtags();
    let hashtagsOnly = [];

    for (let i = 0; i < hashtags.length; i++){
        if ( hashtags[i].match(/^\#.+/) ) {
            hashtagsOnly.push(hashtags[i]);
        }
    }

    const JSONBody = {
        pinataMetadata: {
            "name": "[Smartify] " + document.getElementById('nft-name').value
        },
        pinataContent: {
            "name": document.getElementById('nft-name').value, 
            "description": document.getElementById('nft-description').value, 
            "image": `https://ipfs.io/ipfs/${fileIpfsHash}`, 
            "platform": "Smartify", 
            "symbol": "ITMS", 
            "creator": _CONNECTED_ACC_, 
            "ipfsuri": `ipfs://${fileIpfsHash}`, 
            "mimetype": mimeType, 
            "editions": document.getElementById('nft-editions').value, 
            "royalties": document.getElementById('nft-royalties').value + '%', 
            "hashtags": hashtagsOnly
        }
    };
    
    // console.log(JSONBody);
    // return 0;

    // const axios = require('axios');

    let ipfsJsonCID = '';
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    await axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: document.getElementById('api-key').value, 
                pinata_secret_api_key: document.getElementById('secret-api-key').value
            }
        })
        .then(function (response) {
            //handle response here
            console.log(response.data);
            // document.getElementById('nft-meta-ipfs').value = "ipfs://" + response.data.IpfsHash;
            ipfsJsonCID =  response.data.IpfsHash;
        })
        .catch(function (error) {
            //handle error here
            console.log(error);
            alert(error);
        });

    return ipfsJsonCID;
}



async function pinFileToIPFS() {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let file = document.getElementById('file-to-smartify').files[0];
    // console.log(file);

    let data = new FormData();
    data.append('file', file);

    let ipfsFileCID = '';
    await axios.post(url,
        data,
        {
            headers: {
                'Content-Type': `multipart/form-data; boundary= ${data._boundary}`,
                'pinata_api_key': document.getElementById('api-key').value, 
                'pinata_secret_api_key': document.getElementById('secret-api-key').value
            }
        }
    ).then(function (response) {
        // data: {
        //     IpfsHash: 'QmUtuFJf7XXqL3GgnMcAzcVx3mJXfFJAWxCC9NDPUACY27',
        //     PinSize: 392595,
        //     Timestamp: '2022-01-16T20:47:38.041Z'
        // } 
        console.log(response.data);
        // document.getElementById('nft-image-ipfs').value = "ipfs://" + response.data.IpfsHash;
        // ipfs://QmRV22bKxopT1pbGxSZ8C2v5oUrsBjmrFRwwcjitAvbM2v
        ipfsFileCID =  response.data.IpfsHash;
    }).catch(function (error) {
        console.log(error);
        alert(error);
    });

    return ipfsFileCID;

}


// const keccak256 = require('keccak256')

// console.log(keccak256('hello').toString('hex')) // "1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"

// console.log(keccak256(Buffer.from('hello')).toString('hex')) // "1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8"

// console.log(keccak256('QmaPkJPCPEWc2ue2vmRa2i5ZqTfqufK2Qyky1Y3zVeA6X9').toString('hex'))
// 43b58d50f7bc72987bd0f4d93a06a919c80a19644e8da7f3f4d9589a45a0f730

// console.log(ethers.utils.id('QmaPkJPCPEWc2ue2vmRa2i5ZqTfqufK2Qyky1Y3zVeA6X9'));
// console.log(ethers.utils.id('QmaPkJPCPEWc2ue2vmRa'));

// https://rinkeby.etherscan.io/address/0xfb0c28b3f49c907907b68d5554baec2379d7704b#readContract
// QmbzgiEUepAmw3VKXfXKwyKx2ayqGmj5AKe6hu5eHzCppM
// QmbzgiEUepAmw3VKXfXKwyKx2ayqGmj5
// AKe6hu5eHzCppM
// 0x516d627a676945556570416d7733564b5866584b77794b7832617971476d6a35
// 0x414b653668753565487a4370704d000000000000000000000000000000000000

// console.log(cidToBytes32('QmbzgiEUepAmw3VKXfXKwyKx2ayqGmj5AKe6hu5eHzCppM'));
// [
//     "0x516d627a676945556570416d7733564b5866584b77794b7832617971476d6a35",
//     "0x414b653668753565487a4370704d000000000000000000000000000000000000"
// ]



