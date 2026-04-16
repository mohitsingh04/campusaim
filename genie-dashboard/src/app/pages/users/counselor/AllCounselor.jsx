import UserList from "../shared/UserList";

export default function AllCounselor() {
    return (
        <UserList
            roleKey="counselor"
            title="Counselors"
            apiPath="/fetch-counselor"
            basePath="/dashboard/users/counselors"
            enableAssign
        />
    );
}