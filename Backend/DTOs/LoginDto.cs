namespace Artifax.DTOs
{
    public class LoginDto
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginChallengeDto
    {
        public bool RequiresTwoFactor { get; set; }
        public bool RequiresSetup { get; set; }
        public string UserEmail { get; set; } = "";
        public string Username { get; set; } = "";
        public string UserLevel { get; set; } = "";
        public string? ManualEntryKey { get; set; }
        public string? OtpAuthUri { get; set; }
    }

    public class TotpVerifyDto
    {
        public string Code { get; set; } = "";
    }

    public class TotpVerifyResponseDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeEmail { get; set; } = "";
        public string EmployeeName { get; set; } = "";
        public int BranchId { get; set; }
        public string EmployeeLevel { get; set; } = "";
        public List<string> RecoveryCodes { get; set; } = new();
    }
}