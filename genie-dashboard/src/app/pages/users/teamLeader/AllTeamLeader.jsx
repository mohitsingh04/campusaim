import UserList from "../shared/UserList";

export default function AllTeamLeader() {
    return (
        <UserList
            roleKey="teamLeader"
            title="Team Leader"
            apiPath="/fetch-team-leader"
            basePath="/dashboard/users/team-leaders"
        />
    );
}
