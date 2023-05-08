async function checkConnection() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await provider.listAccounts()
    if (accounts.length) {
      setAddress(accounts[0])
    }
  }
  async function connect() {
    /* this allows the user to connect their wallet */
    const account = await window.ethereum.send('eth_requestAccounts')
    if (account.result.length) {
      setAddress(account.result[0])
    }
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner()
  /* ask the user to sign a message with the challenge info returned from the server */
  const signature = await signer.signMessage("This message is to login you into lenspost dapp.")