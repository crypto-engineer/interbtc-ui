import React, { ReactElement, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { StoreType } from "../../../common/types/util.types";
import { toast } from "react-toastify";
import ButtonMaybePending from "../../../common/components/pending-button";

type RegisterModalType = {
    onClose: () => void;
    onRegister: () => void;
    show: boolean;
};

type RegisterForm = {
    stake: number;
};

export default function ReportModal(props: RegisterModalType): ReactElement {
    const { register, handleSubmit, errors } = useForm<RegisterForm>();
    const relayerLoaded = useSelector((state: StoreType) => state.general.relayerLoaded);
    const [isRegisterPending, setRegisterPending] = useState(false);

    const onSubmit = handleSubmit(async ({ stake }) => {
        if (!relayerLoaded) return;
        setRegisterPending(true);
        try {
            await window.relayer.registerStakedRelayer(stake);
            toast.success("Successfully Registered");
            props.onRegister();
            props.onClose();
        } catch (error) {
            toast.error(error.toString());
        }
        setRegisterPending(false);
    });

    return (
        <Modal show={props.show} onHide={props.onClose}>
            <form onSubmit={onSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Registration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row mb-2">
                        <div className="col-12 de-note">
                            Please note there is a default waiting period before bonding.
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">Stake</div>
                        <div className="col-12 basic-addon">
                            <div className="input-group">
                                <input
                                    name="stake"
                                    type="float"
                                    className={"form-control custom-input" + (errors.stake ? " error-borders" : "")}
                                    defaultValue={0}
                                    aria-describedby="basic-addon2"
                                    ref={register({
                                        // TODO: validate minimum
                                        required: true,
                                    })}
                                ></input>
                                <div className="input-group-append">
                                    <span className="input-group-text" id="basic-addon2">
                                        Planck
                                    </span>
                                </div>
                            </div>
                            {errors.stake && (
                                <div className="input-error">
                                    {errors.stake.type === "required" ? "stake is required" : errors.stake.message}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={props.onClose}>
                        Cancel
                    </Button>
                    <ButtonMaybePending type="submit" isPending={isRegisterPending}>
                        Register
                    </ButtonMaybePending>
                </Modal.Footer>
            </form>
        </Modal>
    );
}
