import Arweave from "arweave";
import TestWeave from "testweave-sdk";
import { JWKInterface } from "arweave/node/lib/wallet";


export const init = async () => {
  const arweave: Arweave = Arweave.init({
    host: "localhost", 
    port: 1984,
    protocol: "http"
  }); 

  const testWeave = await TestWeave.init(arweave);
  const walletKey = testWeave.rootJWK;

  return {
    arweave,
    testWeave,
    walletKey
  }
}


export const ArweaveSdk = () => {
  console.log(Arweave);
  let JWT: JWKInterface;
  console.log(TestWeave);
  return 'arweave-sdk';
}
