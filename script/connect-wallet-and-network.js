// connectWalletAndNetwork.js
// connect wallet and switch network

let isWalletConnected = false;
let isNetworkConnected = false;
let connected0xAccount = '';

// https://docs.ethers.io/ethers-app/html/dev-api-wallet.html
// ethers.onaccount = function(address) {
//     console.log('The user has switched to account: ' + address);
// }


// https://ethereum.stackexchange.com/questions/42768/how-can-i-detect-change-in-account-in-metamask
if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        // Time to reload your interface with accounts[0]!
        connected0xAccount = accounts[0];
        console.log('Account switch detected.');
        console.log(`log: wallet connected to ${connected0xAccount}`);
    })
}



async function connectWallet() {

    if (window.ethereum) {
        try {
            connected0xAccount = await window.ethereum.request({ method: 'eth_requestAccounts' });
            connected0xAccount = connected0xAccount[0];
            isWalletConnected = true;
            console.log(`log: wallet connected to ${connected0xAccount}`);
        }
        catch (error) {
            if (error.code === 4001) {
                isWalletConnected = false;
                console.log('log: connection rejected by user');
            }

            isWalletConnected = false;
            console.log('log: cannot connect to wallet');
        }
    }

}

async function switchNetwork(){
 
    const chainIdTo = '0x2710';
    const chainIdToName = 'smartBCH';
    // const chainIdTo = '0x4';
    // const chainIdToName = 'Testnet Rinkeby';

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdTo }],
        });

        isNetworkConnected = true;
        console.log(`log: switched to ${chainIdToName}`);
    }
    catch (error) {
        if (error.code === 4001) {
            console.log(`log: user rejected network switch to ${chainIdToName}`);
        }

        console.log(`log: cannot switch to ${chainIdToName}`);
        console.log(isWalletConnected);
        console.log(isNetworkConnected);
    }    
}