import { useState } from "react";
import UserList from "../shared/UserList";
import GeneratePartnerLinkModal from "./GeneratePartnerLinkModal";

export default function AllPartner() {
    const [openInviteModal, setOpenInviteModal] = useState(false);

    return (
        <>
            <UserList
                roleKey="partner"
                title="Partners"
                apiPath="/fetch-partner"
                basePath="/dashboard/users/partners"
                onAddClick={() => setOpenInviteModal(true)} // 👈 trigger modal
            />

            <GeneratePartnerLinkModal
                open={openInviteModal}
                onClose={() => setOpenInviteModal(false)}
            />
        </>
    );
}