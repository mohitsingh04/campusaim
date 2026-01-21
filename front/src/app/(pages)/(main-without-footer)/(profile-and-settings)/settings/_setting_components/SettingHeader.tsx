const SettingsHeader = ({
  label = "Settings",
  text = "Manage your account settings and preferences",
}: {
  label: string;
  text?: string;
}) => (
  <div className="sm:mb-8 mb-6 text-(--text-color)">
    <h1 className="heading font-bold text-(--text-color-emphasis)  mb-1">
      {label}
    </h1>
    <p>{text}</p>
  </div>
);

export default SettingsHeader;
