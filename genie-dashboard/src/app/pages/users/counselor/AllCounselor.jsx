import UserList from "../shared/UserList";

export default function AllCounselor() {
    return (
        <UserList
            roleKey="counselor"
            title="Counselors"
            apiPath="/fetch-counselors"
            basePath="/dashboard/users/counselors"
            enableAssign
        />
    );
}