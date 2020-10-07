import React, { useState, MouseEvent } from 'react';

import { IssueRequest } from "../../../common/types/issue.types";
import { Table } from "react-bootstrap";
import { dateToShortString, shortAddress, shortTxId } from "../../../common/utils/utils";
import { FaCheck, FaHourglass } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { StoreType } from "../../../common/types/util.types";
import { useEffect } from "react";
import ButtonMaybePending from '../../../common/components/pending-button';
import { toast } from 'react-toastify';
import { startTransactionWatcherIssue } from '../../../common/utils/transaction-watcher';
import {
    updateIssueRequestAction,
    changeIssueStepAction,
    changeBtcTxIdAction,
    changeIssueIdAction,
    openWizardInEditModeAction,
    changeAmountBTCAction,
    changeVaultBtcAddressAction
} from '../../../common/actions/issue.actions';

type IssueRequestProps = {
    handleShow: () => void;
}

export default function IssueRequests(props: IssueRequestProps) {
    const issueRequests = useSelector((state: StoreType) => state.issue.issueRequests);
    const transactionListeners = useSelector((state: StoreType) => state.issue.transactionListeners);
    const proofListeners = useSelector((state: StoreType) => state.issue.proofListeners);

    const [executePending, setExecutePending] = useState([""]);
    const polkaBTC = useSelector((state: StoreType) => state.api);
    const storage = useSelector((state: StoreType) => state.storage);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            issueRequests.map(async (request: IssueRequest) => {
                if (transactionListeners.indexOf(request.id) === -1) {
                    startTransactionWatcherIssue(request, polkaBTC, dispatch, storage);
                }
            });
        }
        fetchData();
    }, [polkaBTC, issueRequests, proofListeners, transactionListeners, dispatch, storage]);


    const execute = async (request: IssueRequest) => {
        setExecutePending([...executePending, request.id]);
        try {
            // get proof data from bitcoin
            const txId = request.btcTxId;
            const [transactionBlockHeight, merkleProof, rawTx] = await Promise.all([
                polkaBTC.btcCore.getTransactionBlockHeight(txId),
                polkaBTC.btcCore.getMerkleProof(txId),
                polkaBTC.btcCore.getRawTransaction(txId),
            ]);

            if (!transactionBlockHeight) {
                throw new Error("Transaction not yet included in Bitcoin.");
            }
            let provenReq = request;
            provenReq.transactionBlockHeight = transactionBlockHeight;
            provenReq.merkleProof = merkleProof;
            provenReq.rawTransaction = rawTx;
            dispatch(updateIssueRequestAction(provenReq));
            storage.modifyIssueRequest(provenReq);

            toast.success("Fetching proof data for Bitcoin transaction: " + txId);
            const txIdBuffer = Buffer.from(txId, "hex").reverse();

            // prepare types for polkadot
            const parsedIssuedId = polkaBTC.api.createType("H256", provenReq.id);
            const parsedTxId = polkaBTC.api.createType("H256", txIdBuffer);
            const parsedTxBlockHeight = polkaBTC.api.createType("u32", transactionBlockHeight);
            const parsedMerkleProof = polkaBTC.api.createType("Bytes", "0x" + merkleProof);
            const parsedRawTx = polkaBTC.api.createType("Bytes", rawTx);

            toast.success("Executing issue request: " + request.id);
            // execute issue
            const success = await polkaBTC.issue.execute(parsedIssuedId, parsedTxId, parsedTxBlockHeight, parsedMerkleProof, parsedRawTx);

            if (!success) {
                throw new Error("Execute failed.");
            }

            let completedReq = provenReq;
            completedReq.completed = true;
            dispatch(updateIssueRequestAction(completedReq));
            storage.modifyIssueRequest(completedReq);

            toast.success("Succesfully executed issue request: " + request.id);
        } catch (error) {
            toast.error(error.toString());
        }
        setExecutePending(executePending.splice(executePending.indexOf(request.id),1));
    };

    const handleCompleted = (request: IssueRequest) => {
        if (request.confirmations < 6) {
            return (<FaHourglass></FaHourglass>);
        } else if (request.completed) {
            return (<FaCheck></FaCheck>);
        } else {
            console.log("Pending list ===>>>> ", executePending.toString());
            return (
                <ButtonMaybePending
                    variant="outline-dark"
                    isPending={executePending.indexOf(request.id)!==-1}
                    size="lg"
                    block
                    onClick={(event: MouseEvent<HTMLElement>) => { event.stopPropagation(); execute(request); }}>
                    Execute
                </ButtonMaybePending>

            );
        }
    };

    const requestClicked = (request: IssueRequest): void => {
        if (request.completed) return;

        dispatch(openWizardInEditModeAction());
        dispatch(changeVaultBtcAddressAction(request.vaultBTCAddress));
        dispatch(changeAmountBTCAction(request.amountBTC));
        dispatch(changeBtcTxIdAction(request.btcTxId));
        dispatch(changeIssueIdAction(request.id));
        dispatch(changeIssueStepAction("BTC_PAYMENT_CONFIRMATION"));
        props.handleShow();
    }

    return (
        <div>
            <Table hover responsive size={"md"}>
                <thead>
                    <tr>
                        <th>Issue ID</th>
                        <th>Amount</th>
                        <th>Creation</th>
                        <th>Vault BTC Address</th>
                        <th>BTC Transaction</th>
                        <th>Confirmations</th>
                        <th>Completed</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        issueRequests && issueRequests.map((request: IssueRequest) => {
                            return (
                                <tr onClick={() => requestClicked(request)}>
                                    <td>{shortAddress(request.id)}</td>
                                    <td>{request.amountBTC} PolkaBTC</td>
                                    <td>{dateToShortString(request.creation)}</td>
                                    <td>{shortAddress(request.vaultBTCAddress)}</td>
                                    <td>{shortTxId(request.btcTxId)}</td>
                                    <td>{request.confirmations}</td>
                                    <td>{handleCompleted(request)}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </Table>
        </div >
    );
}