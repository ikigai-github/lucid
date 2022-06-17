import {
    Address,
    Assets,
    Datum,
    DatumHash,
    ProtocolParameters,
    ProviderSchema,
    Slot,
    TxHash,
    Unit,
    UTxO,
  } from '../types';

import Core from 'core/types'
import { createInteractionContext, createStateQueryClient, createTxSubmissionClient, InteractionContext, isAlonzoProtocolParameters, isShelleyProtocolParameters } from '@cardano-ogmios/client';
import { Point, ProtocolParametersAlonzo, ProtocolParametersShelley, TxIn, TxOut, Utxo } from '@cardano-ogmios/schema';
import { datumJsonToCbor } from './blockfrost';

const context : InteractionContext = await createInteractionContext(
    err => console.error(err),
    () => console.log("Connection closed.")
)

const stateQueryClient = await createStateQueryClient(context);
const submissionClient = await createTxSubmissionClient(context);

const odc_body = (hash: string) => { 
    return {"type": "jsonwsp/request",
        "version": "1.0",
        "servicename": "ogmios",
        "methodname": "GetDatumByHash",
        "args": {
        "hash": hash
        },
        // optional
        "mirror": {"meta": "this object will be mirrored under 'reflection' field in a response to this request"}}          
}



export class Ogmios implements ProviderSchema {

    constructor() {
    }

    async getProtocolParameters(): Promise<ProtocolParameters> {
        const result = await stateQueryClient.currentProtocolParameters()
        const recastResult = result as ProtocolParametersAlonzo | ProtocolParametersShelley;

        return { //TODO figure out appropriate defaults
            minFeeA: result.minFeeCoefficient ?? 0,
            minFeeB: result.minFeeConstant ?? 0,
            maxTxSize: result.maxTxSize ?? 0,
            maxValSize: result.maxBlockHeaderSize ?? 5000, //TODO this isn't right. look into how this is calculated
            keyDeposit: BigInt(result.stakeKeyDeposit ?? 0),
            poolDeposit: BigInt(result.poolDeposit ?? 0),
            priceMem: isShelleyProtocolParameters(recastResult) ?
                0 :
                parseFloat((result as ProtocolParametersAlonzo).prices?.memory ?? "0"),
            priceStep: isShelleyProtocolParameters(recastResult) ?
            0 :
            parseFloat((result as ProtocolParametersAlonzo).prices?.steps ?? "0"),
            coinsPerUtxoWord: BigInt(isAlonzoProtocolParameters(recastResult) ? (result as ProtocolParametersAlonzo).coinsPerUtxoWord ?? 0 : 0)
          };
    }


    async getCurrentSlot(): Promise<Slot> {
        const result = await stateQueryClient.ledgerTip().then((rslt) => rslt as Point)

        return result.slot;
    }

    async getUtxos(address: Address): Promise<UTxO[]> {
        const result = await stateQueryClient.utxo([address])
        

    return [this.UtxoToUTxO(result)]
    }

    //convert utxo from Ogmios expected type to Lucid expected type
    UtxoToUTxO(input: Utxo): UTxO {
        const txin: TxIn = input[0][0]
        const txout: TxOut = input[0][1]

        return {
            txHash: txin.txId,
            outputIndex: txin.index,
            assets: txout.value.assets as Assets,
            address: txout.address,
            datumHash: txout.datumHash ?? undefined,
            datum: txout.datum as string //conversion of [k: string] : undefined will probably need to be cleaned
        }
    }

    //todo
    getUtxosWithUnit?(address: Address, unit: Unit): Promise<UTxO[]>;


    // getDatum requires Ogmios-Datum-Cache, another MLabs tool
    async getDatum(datumHash: DatumHash): Promise<Datum> {
        const datum = await fetch('todo', {
            body: JSON.stringify(odc_body(datumHash.toString()))
        })
          .then(res => res.json())
          .then(res => res.json_value);
        if (!datum || datum.error)
          throw new Error(`No datum found for datum hash: ${datumHash}`);
        return datumJsonToCbor(datum);
      }

    //todo
    awaitTx?(txHash: TxHash): Promise<boolean>;

    async submitTx(tx: Core.Transaction): Promise<TxHash> {
        const result = await submissionClient.submitTx(tx.to_bytes().toString())
        return result
    }
}