function formatRole(role) {
  return role.replace(/_/g, " ");
}

export default function RecentUsers({ users }) {
  if (!users.length) {
    return <p className="empty-state">No users have been registered yet.</p>;
  }

  return (
    <div className="recent-users" role="region" aria-label="Recently registered users">
      <div className="recent-users__header"><span>User</span><span>Role</span><span>Joined</span></div>
      {users.map((user) => (
        <div className="recent-users__row" key={user.id}>
          <span><strong>{user.fullName}</strong><small>{user.email}</small></span>
          <span className="role-badge">{formatRole(user.role)}</span>
          <time dateTime={user.createdAt}>{new Intl.DateTimeFormat("en-LK", { day: "numeric", month: "short", year: "numeric" }).format(new Date(user.createdAt))}</time>
        </div>
      ))}
    </div>
  );
}
