document.getElementById('h4-mint-status').innerHTML = MINTING_STATUS;



/* ------------------------------------------------------------------------------------- */
// supported MIME Types

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

const statusMessageUploadingFile = 'Uploading file to IPFS... ';
const statusMessageUploadingMeta = 'Uploading metadata to IPFS... ';
const statusMessageMinting = 'Minting NFT... ';
const statusMessageMinted = 'NFT(s) minted. ';
const statusMessageHashtagging = 'Hashtagging on-chain... ';
const statusMessageHashtagged = 'Hashtagged on-chain. ';

/* ------------------------------------------------------------------------------------- */
// api keys <-> cookie

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


/* ------------------------------------------------------------------------------------- */
// Button <-> File box

function updateFile(){
    // console.log('file changed');
    if (document.getElementById('file-to-smartify').value != ''){
        document.getElementById('button-for-file').innerHTML = document.getElementById('file-to-smartify').files[0].name;
    } else {
        document.getElementById('button-for-file').innerHTML = 'Select File to Smartify';
    }
}


/* ------------------------------------------------------------------------------------- */
// '?' Information toggle

// function showDiv(elementId){
//     if (document.getElementById(elementId).style.display == 'block'){
//         document.getElementById(elementId).style.display = 'none';
//     } else {
//         document.getElementById(elementId).style.display = 'block';
//     }
// }




/* ------------------------------------------------------------------------------------- */
// test inputs for json file

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



/* ------------------------------------------------------------------------------------- */
// Go Back to Inputs Layout
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



/* ------------------------------------------------------------------------------------- */
// Preview
let accountWeb3 = '';
let mimeType = '';
let inPreview = false;
let mintTo = '';

async function showPreview() {

    /* Check file, and file type, if supported */
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

    /* Check and require title */
    if ( document.getElementById('nft-name').value == ''){
        alert('Please specify a title for the NFT.');
        return 0;
    }

    /* Check and require editions */
    if ( document.getElementById('nft-editions').value == '' ){
        alert('Please specify the number of editions (min = 1).');
        return 0;
    }

    /* Check and require title */
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
        alert(`Please connect wallet to the ${NETWORK_NAME} network.`);
        return 0;
    }

    const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
    const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);
    const isWhitelisted = await smartifyContract.verifyUser(_CONNECTED_ACC_);
    console.log('isWhitelisted: ' + isWhitelisted);
    const whitelistWaiver = await smartifyContract.whitelistWaiver();
    console.log('whitelistWaiver: ' + whitelistWaiver);
    if (! (isWhitelisted || whitelistWaiver)){
        alert('Sorry, you currently do not have the right to mint.');
        return 0;
    }

    inPreview = true;
    console.log('inPreview: ' + inPreview);

    /* Scroll to page top */
    // document.documentElement.scrollTop || document.body.scrollTop
    document.documentElement.scrollTop = document.body.scrollTop = 0;

    
    const hashtags = parseHashtags();
    let previewContent = 
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

[ Royalties Suggeston ] <span style="font-size: 10px">** Only a suggestion per EIP-2981; actual implementation/payout is up to the marketplaces. **</span>
<div class="preview-fields">${Math.round(document.getElementById('nft-royalties').value*100)/100} %</div>

[ Pinata API Keys ]
<div class="preview-fields">${document.getElementById('api-key').value}</div>
<div class="preview-fields">${document.getElementById('secret-api-key').value}</div>

[ NFT Recipient ]
<div class="preview-fields">${mintTo}</div>

`;

    document.getElementById('div-preview').innerHTML = previewContent;

    document.getElementById('div-input').style.display = 'none';

    document.getElementById('button-preview').style.display = 'none';
    document.getElementById('button-back').style.display = 'inline';
    document.getElementById('button-smartify').style.display = 'inline';

    document.getElementById('div-preview').style.display = 'block';
}


let isSmartifying = false;
let firstTokenId = 0;

async function smartify(){

    if ( isSmartifying == false ){

        isSmartifying = true;
        document.getElementById('button-back').style.display = 'none';

        /* upload file to IPFS */
        document.getElementById('span-status').innerHTML = statusMessageUploadingFile + SPINNING_WHEEL_IMG;
        const fileIpfsHash = await pinFileToIPFS();
        console.log(fileIpfsHash);
        if ( fileIpfsHash == '' ){
            document.getElementById('span-status').innerHTML = 'File upload failed.';
            return 0;
        }

        /* upload metadeta to IPFS */
        document.getElementById('span-status').innerHTML = statusMessageUploadingMeta + SPINNING_WHEEL_IMG;
        const jsonIpfsHash = await pinJSONToIPFS(fileIpfsHash);
        console.log(jsonIpfsHash);
        if ( jsonIpfsHash == '' ){
            document.getElementById('span-status').innerHTML = 'Metadata upload failed.';
            return 0;
        }
        
        /* convert CID to two bytes32 */
        const [part_1, part_2] = cidToBytes32(jsonIpfsHash);

        
        /* Minting */
        document.getElementById('span-status').innerHTML = statusMessageMinting + SPINNING_WHEEL_IMG;

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
                Math.round(document.getElementById('nft-royalties').value * 100),
                { value: BigInt(mintFee) * BigInt(document.getElementById('nft-editions').value) });

                const tx = await contractFunction.wait();
                const event = tx.events[0];
                console.log(event);
                firstTokenId = event.args[2].toNumber();
            
                document.getElementById('span-status').innerHTML = statusMessageMinted;
                document.getElementById('button-hashtag').style.display = 'inline';
                document.getElementById('button-next-item').style.display = 'inline';
        } catch(e) {
            alert(e);
            console.log(e);
            return 0;
        }

        isSmartifying = false;    

    }
}


function parseHashtags(){
    const _inputHashtags = document.getElementById('nft-hashtags').value;

    let _hashtags = _inputHashtags.split(/[\s,]+/);
    _hashtags = _hashtags.map(s => s.trim());

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
        document.getElementById('span-status').innerHTML = statusMessageMinted + statusMessageHashtagging + SPINNING_WHEEL_IMG;

        const contractFunction = await smartifyContract.createTokenHashtags(
            firstTokenId, 
            hashtagToBytes32(threeHashtags[0]), 
            hashtagToBytes32(threeHashtags[1]), 
            hashtagToBytes32(threeHashtags[2]), 
            );
        const tx = await contractFunction.wait();
        const event = tx.events[0];
        console.log(event);

        document.getElementById('span-status').innerHTML = statusMessageMinted + statusMessageHashtagged;
        
    } catch(e) {
        document.getElementById('span-status').innerHTML = statusMessageMinted;
        alert(e);
    }
    
}


async function pinJSONToIPFS(fileIpfsHash) {
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
            console.log(response.data);
            ipfsJsonCID =  response.data.IpfsHash;
        })
        .catch(function (error) {
            console.log(error);
            alert(error);
        });

    return ipfsJsonCID;
}



async function pinFileToIPFS() {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let file = document.getElementById('file-to-smartify').files[0];

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
        console.log(response.data);
        ipfsFileCID =  response.data.IpfsHash;
    }).catch(function (error) {
        console.log(error);
        alert(error);
    });

    return ipfsFileCID;

}

function onMintNew(){
    location.reload();

    /* Scroll to page top */
    // document.documentElement.scrollTop || document.body.scrollTop
    document.documentElement.scrollTop = document.body.scrollTop = 0;
}