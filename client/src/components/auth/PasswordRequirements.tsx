export const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    {
      id: "length",
      text: "At least 6 characters",
      met: password.length >= 6,
    },
    {
      id: "lowercase",
      text: "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      id: "uppercase",
      text: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      id: "number",
      text: "Contains number",
      met: /[0-9]/.test(password),
    },
    {
      id: "special",
      text: "Contains special character",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-foreground/70 mb-2">
        Password requirements:
      </p>
      <ul className="space-y-1">
        {requirements.map((req) => (
          <li key={req.id} className="flex items-center gap-2 text-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                req.met ? "bg-green-500" : "bg-foreground/30"
              }`}
            ></span>
            <span className={req.met ? "text-green-600" : "text-foreground/60"}>
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
