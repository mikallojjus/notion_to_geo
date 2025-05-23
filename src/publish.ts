import { Ipfs, type Op } from "@graphprotocol/grc-20";
import { wallet } from "./wallet";
import { getSmartAccountWalletClient } from '@graphprotocol/grc-20';

// IMPORTANT: Be careful with your private key. Don't commit it to version control.
// You can get your private key using https://www.geobrowser.io/export-wallet
const privateKey = process.env.PK_SW;
const smartAccountWalletClient = await getSmartAccountWalletClient({
  privateKey,
  // rpcUrl, // optional
});

type PublishOptions = {
	spaceId: string;
	editName: string;
	author: string;
	ops: Op[];
};

export async function publish(options: PublishOptions, network: string) {
	const cid = await Ipfs.publishEdit({
		name: options.editName,
		author: options.author,
		ops: options.ops,
	});

	// This returns the correct contract address and calldata depending on the space id
	// Make sure you use the correct space id in the URL below and the correct network.
	const result = await fetch(`https://api-testnet.grc-20.thegraph.com/space/${options.spaceId}/edit/calldata`, {
		method: "POST",
		body: JSON.stringify({
			cid: cid,
			// Optionally specify TESTNET or MAINNET. Defaults to MAINNET
			network: network,
		}),
	});

	const { to, data } = await result.json();

	if (network == "TESTNET") {
		return await wallet.sendTransaction({
			to: to,
			value: 0n,
			data: data,
		});
	} else if (network == "MAINNET") {
		return await smartAccountWalletClient.sendTransaction({
			to: to,
			value: 0n,
			data: data,
		});
	} else {
		console.error("ERROR: INCORRECT NETWORK SPECIFIED (CHOOSE EITHER TESTNET OR MAINNET")
	}
}