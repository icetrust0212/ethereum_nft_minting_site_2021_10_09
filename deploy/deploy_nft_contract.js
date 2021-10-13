require('dotenv').config()

const MAINNET = "1"
const ROPSTEN = "3";
const RINKBY = "4";
const KOVAN = "42";

const fs = require("fs");
const rfs = require("recursive-fs");
const fetch = require("node-fetch");

const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const GITHUB = "github";
  const PINATA = "pinata";
  const metadata_location = process.env.METADATA_LOCATION; //  github, pinata
  const PREDEFINED_GITHUB_GIST_ID = process.env.PREDEFINED_GITHUB_GIST_ID;

  const {deployer} = await getNamedAccounts();
  const network = await hre.getChainId();
 
  const TEMP_METADATA_DIR = './temp_metadata';
  const GIST_URL_PREFIX = "https://gist.github.com/raw/"

  let gistId;
  let contractUri;
  let baseMetadataUri;
  let VRFCoordinator;
  let LinkToken;
  let keyhash;

  // OpenSea proxy registry addresses for ROPSTEN and mainnet.
  let proxyRegistryAddress;
  if (network === RINKBY) {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  } else if (network === MAINNET) {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  } else {
    proxyRegistryAddress = "0xf57b2c51ded3a29e6891aba85459d600256cf317";
  }

  //set VRFCoordinator and LinkToken, keyhash for VRF random generate
  switch (network) {
    case MAINNET:
      VRFCoordinator = "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952";
      LinkToken = "0x514910771AF9Ca656af840dff83E8264EcF986CA";
      keyhash = "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445";
      break;
    case KOVAN:
      VRFCoordinator = "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9";
      LinkToken = "0xa36085F69e2889c224210F603D836748e7dC0088";
      keyhash = "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4";
      break;
    case RINKBY:
      VRFCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
      LinkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
      keyhash = "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
      break;
    case ROPSTEN:
      // VRFCoordinator = 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B;
      // LinkToken = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709;
      // keyhash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
      break;
    default:
      VRFCoordinator = "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B";
      LinkToken = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
      keyhash = "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311";
  }

  // GIT - get the contract parameters
  switch (metadata_location) {
    case GITHUB:

      let data; 
      // use the predefined key if it exists
      if (PREDEFINED_GITHUB_GIST_ID) {
        console.log("using predefined github gist: " + PREDEFINED_GITHUB_GIST_ID);

        gistId = PREDEFINED_GITHUB_GIST_ID;

        // pull the data
        let url = GIST_URL_PREFIX + PREDEFINED_GITHUB_GIST_ID;

        await fetch(url)
        .then((res) => res.json())
        .then((json) => {
          data = json;
        });
      }

      else // load it from the temp metadata files
      {
        let {files, dirs} = await rfs.read(TEMP_METADATA_DIR);
      
        // on clean run, dirs[1] should contain the directory
        gistId = dirs[1].split(TEMP_METADATA_DIR).pop().split("/")[1];
        console.log("found metadata on github gist: " + gistId);

        // files[0] should contain the contract uri file, read it and get the name and symbol
        data = JSON.parse(fs.readFileSync(files[0]).toString());
        tokenAmount = files.length;
      }

      // set the uri details
      contractUri = GIST_URL_PREFIX + gistId;
      baseMetadataUri = contractUri + "/";
      contractName = data.name;
      contractSymbol = data.symbol;

    break;
  case PINATA:
      {
        const ERC721Config = require('../temp_metadata/ERC721Config.json');
        const contractconfig = require('../temp_metadata/contracturi.json')
        baseMetadataUri = ERC721Config.gatewayUrl + "/" + ERC721Config.metadataHash + "/";
        contractUri = ERC721Config.gatewayUrl + "/" + ERC721Config.contractUriHash;
        contractName = contractconfig.name;
        contractSymbol = contractconfig.symbol;
        tokenAmount = ERC721Config.tokenAmount;
      }
      break;
  }

  console.log("------")
  console.log("metadata_location: " + metadata_location);
  console.log("Deployer: " + deployer);
  console.log("network: " + network);
  console.log("uri: " + contractUri);
  console.log("name: " + contractName);
  console.log("symbol: " + contractSymbol);
  console.log('tokenAmount: ', tokenAmount);
  console.log("------")

  await deploy('Iceberg', {
    from: deployer,
    args: [
      baseMetadataUri,
      tokenAmount,
      VRFCoordinator,
      LinkToken,
      keyhash
    ],
    log: true
  });
};

module.exports = func;
func.tags = ['Iceberg'];