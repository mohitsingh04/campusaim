import UserList from "../shared/UserList";

export default function AllTeamLeader() {
    return (
        <UserList
            roleKey="teamLeader"
            title="Team Leader"
            apiPath="/fetch-teamleader"
            basePath="/dashboard/users/team-leaders"
        />
    );
}
