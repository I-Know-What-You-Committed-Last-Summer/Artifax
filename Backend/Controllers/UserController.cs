using Microsoft.AspNetCore.Mvc;
using Artifax.DTOs;
using Artifax.Models;
using Artifax.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using System.Security.Cryptography;
using System.Text;
using System;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class UserController : ControllerBase
    {
        const string UserLevelSessionKey = "UserLevel";
        const string UserEmailSessionKey = "UserEmail";
        const string UsernameSessionKey = "Username";
        const string PendingUserIdKey = "PendingUserId";
        const string PendingUserEmailKey = "PendingUserEmail";
        const string PendingUsernameKey = "PendingUsername";
        const string PendingUserLevelKey = "PendingUserLevel";
        const int TotpDigits = 6;
        const int TotpStepSeconds = 30;
        const int MaxFailedLoginAttempts = 5;
        const int MaxFailedOtpAttempts = 5;
        internal enum EmployeeLevels
        {
            Employee,
            Admin
        }

        readonly ArtifaxContext context;

        public UserController(ArtifaxContext incoming)
        {
            context = incoming;
        }

        bool IsAdminSession()
        {
            return HttpContext?.Session?.GetString(UserLevelSessionKey) == EmployeeLevels.Admin.ToString();
        }

        static string GenerateBase32Secret()
        {
            Span<byte> secretBytes = stackalloc byte[20];
            RandomNumberGenerator.Fill(secretBytes);
            return Base32Encode(secretBytes.ToArray());
        }

        static string Base32Encode(byte[] data)
        {
            const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            var output = new StringBuilder((data.Length + 4) / 5 * 8);
            int buffer = data[0];
            int next = 1;
            int bitsLeft = 8;

            while (bitsLeft > 0 || next < data.Length)
            {
                if (bitsLeft < 5)
                {
                    if (next < data.Length)
                    {
                        buffer <<= 8;
                        buffer |= data[next++] & 0xff;
                        bitsLeft += 8;
                    }
                    else
                    {
                        int pad = 5 - bitsLeft;
                        buffer <<= pad;
                        bitsLeft += pad;
                    }
                }

                int index = (buffer >> (bitsLeft - 5)) & 0x1f;
                bitsLeft -= 5;
                output.Append(alphabet[index]);
            }

            return output.ToString();
        }

        static byte[] Base32Decode(string input)
        {
            string normalized = input.Trim().TrimEnd('=').ToUpperInvariant();
            var output = new List<byte>();
            int buffer = 0;
            int bitsLeft = 0;

            foreach (char c in normalized)
            {
                int value = c switch
                {
                    >= 'A' and <= 'Z' => c - 'A',
                    >= '2' and <= '7' => c - '2' + 26,
                    _ => -1,
                };

                if (value < 0)
                {
                    continue;
                }

                buffer = (buffer << 5) | value;
                bitsLeft += 5;

                if (bitsLeft >= 8)
                {
                    output.Add((byte)((buffer >> (bitsLeft - 8)) & 0xff));
                    bitsLeft -= 8;
                }
            }

            return output.ToArray();
        }

        static string GenerateTotpCode(string base32Secret, DateTimeOffset timestamp)
        {
            byte[] secretBytes = Base32Decode(base32Secret);
            long counter = timestamp.ToUnixTimeSeconds() / TotpStepSeconds;
            byte[] counterBytes = BitConverter.GetBytes(counter);
            if (BitConverter.IsLittleEndian)
            {
                Array.Reverse(counterBytes);
            }

            using var hmac = new HMACSHA1(secretBytes);
            byte[] hash = hmac.ComputeHash(counterBytes);
            int offset = hash[^1] & 0x0f;
            int binaryCode = ((hash[offset] & 0x7f) << 24)
                | ((hash[offset + 1] & 0xff) << 16)
                | ((hash[offset + 2] & 0xff) << 8)
                | (hash[offset + 3] & 0xff);
            int otp = binaryCode % (int)Math.Pow(10, TotpDigits);
            return otp.ToString($"D{TotpDigits}");
        }

        static bool IsValidTotpCode(string base32Secret, string code)
        {
            if (string.IsNullOrWhiteSpace(base32Secret) || string.IsNullOrWhiteSpace(code))
            {
                return false;
            }

            var now = DateTimeOffset.UtcNow;
            for (int drift = -1; drift <= 1; drift++)
            {
                string expectedCode = GenerateTotpCode(base32Secret, now.AddSeconds(drift * TotpStepSeconds));
                if (string.Equals(expectedCode, code.Trim(), StringComparison.Ordinal))
                {
                    return true;
                }
            }

            return false;
        }

        static string BuildOtpAuthUri(Employee employee)
        {
            string issuer = Uri.EscapeDataString("Artifax");
            string label = Uri.EscapeDataString($"Artifax:{employee.EmployeeEmail}");
            string secret = Uri.EscapeDataString(employee.TotpSecret ?? string.Empty);
            return $"otpauth://totp/{label}?secret={secret}&issuer={issuer}&digits={TotpDigits}&period={TotpStepSeconds}";
        }

        static List<string> GenerateRecoveryCodes(int count = 8)
        {
            const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var recoveryCodes = new List<string>(count);
            byte[] randomBytes = new byte[8];

            for (int codeIndex = 0; codeIndex < count; codeIndex++)
            {
                RandomNumberGenerator.Fill(randomBytes);
                var code = new char[8];

                for (int characterIndex = 0; characterIndex < code.Length; characterIndex++)
                {
                    code[characterIndex] = alphabet[randomBytes[characterIndex] % alphabet.Length];
                }

                recoveryCodes.Add(new string(code));
            }

            return recoveryCodes;
        }

        static string HashRecoveryCodes(IEnumerable<string> recoveryCodes)
        {
            return string.Join('\n', recoveryCodes.Select(BCrypt.Net.BCrypt.HashPassword));
        }

        static bool TryConsumeRecoveryCode(Employee employee, string inputCode)
        {
            if (string.IsNullOrWhiteSpace(employee.RecoveryCodesHash) || string.IsNullOrWhiteSpace(inputCode))
            {
                return false;
            }

            var remainingHashes = new List<string>();
            bool matched = false;

            foreach (string hash in employee.RecoveryCodesHash
                .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries))
            {
                if (!matched && BCrypt.Net.BCrypt.Verify(inputCode.Trim(), hash))
                {
                    matched = true;
                    continue;
                }

                remainingHashes.Add(hash);
            }

            if (!matched)
            {
                return false;
            }

            employee.RecoveryCodesHash = string.Join('\n', remainingHashes);
            return true;
        }

        void SetPendingLogin(Employee employee)
        {
            HttpContext.Session.SetString(PendingUserIdKey, employee.EmployeeId.ToString());
            HttpContext.Session.SetString(PendingUserEmailKey, employee.EmployeeEmail);
            HttpContext.Session.SetString(PendingUsernameKey, employee.EmployeeName);
            HttpContext.Session.SetString(PendingUserLevelKey, employee.EmployeeLevel);
        }

        void ClearPendingLogin()
        {
            HttpContext.Session.Remove(PendingUserIdKey);
            HttpContext.Session.Remove(PendingUserEmailKey);
            HttpContext.Session.Remove(PendingUsernameKey);
            HttpContext.Session.Remove(PendingUserLevelKey);
        }

        void SetAuthenticatedSession(Employee employee)
        {
            HttpContext.Session.SetString(UserLevelSessionKey, employee.EmployeeLevel);
            HttpContext.Session.SetString(UserEmailSessionKey, employee.EmployeeEmail);
            HttpContext.Session.SetString(UsernameSessionKey, employee.EmployeeName);
        }

        #region GetRoutes
            //Get All Employees
            [HttpGet]
            public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAllUsers ()
            {
                if (!IsAdminSession())
                {
                    return Unauthorized("Access denied.");
                }

                return await context.Employees.Select(employee => EmployeeReadDto.ToDto(employee)).ToListAsync();
            }
            
            [HttpGet("employees")]
            public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAllEmployees ()
            {
                if (!IsAdminSession())
                {
                    return Unauthorized("Access denied.");
                }

                return await context.Employees.Where(employee => employee.EmployeeLevel == EmployeeLevels.Employee.ToString()).Select(employee => EmployeeReadDto.ToDto(employee)).ToListAsync();
            }

            [HttpGet("admins")]
            public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAllAdmins ()
            {
                if (!IsAdminSession())
                {
                    return Unauthorized("Access denied.");
                }

                return await context.Employees.Where(employee => employee.EmployeeLevel == EmployeeLevels.Admin.ToString()).Select(employee => EmployeeReadDto.ToDto(employee)).ToListAsync();
            }

            //Get All Employee by Id
            [HttpGet("employee/{email}")]
            public async Task<ActionResult<EmployeeReadDto>> GetEmployeeByEmail (string email)
            {
                if (!IsAdminSession())
                {
                    return Unauthorized("Access denied.");
                }

                var _result = await context.Employees.FirstOrDefaultAsync(employee => employee.EmployeeEmail == email);
                if (_result == null) return NotFound();
                return EmployeeReadDto.ToDto(_result);
            }

            [HttpGet("me")]
            public IActionResult GetCurrentUser()
            {
                // Check if a session exists
                var _userLevel = HttpContext.Session.GetString(UserLevelSessionKey);

                if (string.IsNullOrEmpty(_userLevel))
                {
                    // If no session exists, the user is logged out. 
                    // Returning 401 Unauthorized tells the frontend to redirect to the login screen.
                    return Unauthorized("No active session.");
                }

                // Return an anonymous object (or create a new CurrentUserDto) with the display details
                return Ok(new 
                {
                    UserLevel = _userLevel,
                    UserEmail = HttpContext.Session.GetString(UserEmailSessionKey),
                    Username = HttpContext.Session.GetString(UsernameSessionKey)
                });
            }
        #endregion

        #region DevHelpers
        // Development-only endpoint to seed an admin account for local testing.
        [HttpPost("seed/admin")]
        public async Task<ActionResult<EmployeeReadDto>> SeedAdmin([FromBody] EmployeeWriteDto incoming)
        {
            // Only allow in Development environment
            var env = HttpContext.RequestServices.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            if (env == null || !env.EnvironmentName.Equals("Development", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (incoming == null || string.IsNullOrWhiteSpace(incoming.EmployeeEmail))
            {
                return BadRequest("Missing admin details");
            }

            bool exists = await context.Employees.AnyAsync(e => e.EmployeeEmail == incoming.EmployeeEmail);
            if (exists) return Conflict("Email already exists");

            var _employee = new Employee()
            {
                BranchId = incoming.BranchID,
                EmployeeEmail = incoming.EmployeeEmail,
                EmployeeName = incoming.EmployeeName,
                EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.EmployeePassword),
                EmployeeLevel = EmployeeLevels.Admin.ToString()
            };

            context.Employees.Add(_employee);
            await context.SaveChangesAsync();

            return Ok(EmployeeReadDto.ToDto(_employee));
        }

        // Development-only endpoint to seed an employee account for local testing.
        [HttpPost("seed/employee")]
        public async Task<ActionResult<EmployeeReadDto>> SeedEmployee([FromBody] EmployeeWriteDto incoming)
        {
            var env = HttpContext.RequestServices.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            if (env == null || !env.EnvironmentName.Equals("Development", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            if (incoming == null || string.IsNullOrWhiteSpace(incoming.EmployeeEmail))
            {
                return BadRequest("Missing employee details");
            }

            bool branchExists = await context.Branches.AnyAsync(branch => branch.BranchID == incoming.BranchID);
            if (!branchExists)
            {
                return NotFound($"Branch with ID: [{incoming.BranchID}] could not be found");
            }

            bool exists = await context.Employees.AnyAsync(employee => employee.EmployeeEmail == incoming.EmployeeEmail);
            if (exists) return Conflict("Email already exists");

            var employeeToCreate = new Employee()
            {
                BranchId = incoming.BranchID,
                EmployeeEmail = incoming.EmployeeEmail,
                EmployeeName = incoming.EmployeeName,
                EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.EmployeePassword),
                EmployeeLevel = EmployeeLevels.Employee.ToString()
            };

            context.Employees.Add(employeeToCreate);
            await context.SaveChangesAsync();

            return Ok(EmployeeReadDto.ToDto(employeeToCreate));
        }
        #endregion
        
        #region PostRoutes

            // summary
            // Registers a new employee in the system and hashes their password.

            [HttpPost("employee")]
            public async Task<ActionResult<EmployeeReadDto>> CreateEmployee (EmployeeWriteDto incoming)
            {
                //Authentication Test
                if (!IsAdminSession())
                {
                    return Unauthorized("Creation attempted by non-admin!");
                }

                //Check whether employee with incoming details already exists to prevent duplicate emails for login
                bool _employeeFound = await context.Employees.FirstOrDefaultAsync(_employee => _employee.EmployeeEmail == incoming.EmployeeEmail) != null;
                if (_employeeFound) return Unauthorized ("Email Already Exists");

                //Creates new employee from incoming details
                Employee _employee = new ()
                {
                    BranchId = incoming.BranchID,
                    EmployeeEmail = incoming.EmployeeEmail,
                    EmployeeName = incoming.EmployeeName,
                    EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.EmployeePassword),
                    EmployeeLevel = incoming.EmployeeLevel
                };

                //Save new employee to database
                context.Employees.Add(_employee);
                await context.SaveChangesAsync();

                //Convert new employee to Read DTO using static function in EmployeeReadDto class
                EmployeeReadDto _dto = EmployeeReadDto.ToDto(_employee);

                return CreatedAtAction("GetAllEmployeeById", new { id = _employee.EmployeeId}, _dto);
            }

            [HttpPost("employees/login")]
            public async Task<ActionResult<LoginChallengeDto>> LoginEmployee (LoginDto incoming)
            {
                //Find employee by email
                var _employee = await context.Employees.FirstOrDefaultAsync(employee => employee.EmployeeEmail == incoming.Email);
                if (_employee == null) return Unauthorized ("Employee Not Found");

                if (_employee.LockedUntilUtc.HasValue && _employee.LockedUntilUtc.Value > DateTime.UtcNow)
                {
                    return StatusCode(StatusCodes.Status429TooManyRequests, $"Too many failed login attempts. Try again after {_employee.LockedUntilUtc.Value:u}.");
                }

                //Verify employee password
                if (!BCrypt.Net.BCrypt.Verify(incoming.Password, _employee.EmployeePasswordHash))
                {
                    _employee.FailedLoginAttempts += 1;
                    if (_employee.FailedLoginAttempts >= MaxFailedLoginAttempts)
                    {
                        _employee.LockedUntilUtc = DateTime.UtcNow.AddMinutes(15);
                        _employee.FailedLoginAttempts = 0;
                    }

                    await context.SaveChangesAsync();
                    return Unauthorized("Incorrect Password");
                }

                _employee.FailedLoginAttempts = 0;
                _employee.LockedUntilUtc = null;

                HttpContext.Session.Clear();
                if (string.IsNullOrWhiteSpace(_employee.TotpSecret))
                {
                    _employee.TotpSecret = GenerateBase32Secret();
                    _employee.TotpEnabled = false;
                    await context.SaveChangesAsync();
                }

                SetPendingLogin(_employee);
                await context.SaveChangesAsync();

                return Ok(new LoginChallengeDto
                {
                    RequiresTwoFactor = true,
                    RequiresSetup = !_employee.TotpEnabled,
                    UserEmail = _employee.EmployeeEmail,
                    Username = _employee.EmployeeName,
                    UserLevel = _employee.EmployeeLevel,
                    ManualEntryKey = _employee.TotpEnabled ? null : _employee.TotpSecret,
                    OtpAuthUri = _employee.TotpEnabled ? null : BuildOtpAuthUri(_employee)
                });
            }

            [HttpPost("employees/login/verify")]
            public async Task<ActionResult<TotpVerifyResponseDto>> VerifyLoginTotp(TotpVerifyDto incoming)
            {
                string? pendingUserId = HttpContext.Session.GetString(PendingUserIdKey);
                if (string.IsNullOrWhiteSpace(pendingUserId) || !int.TryParse(pendingUserId, out int employeeId))
                {
                    return Unauthorized("Login session expired. Please sign in again.");
                }

                var employee = await context.Employees.FirstOrDefaultAsync(user => user.EmployeeId == employeeId);
                if (employee == null || string.IsNullOrWhiteSpace(employee.TotpSecret))
                {
                    ClearPendingLogin();
                    return Unauthorized("Unable to verify the one-time code.");
                }

                if (employee.OtpLockedUntilUtc.HasValue && employee.OtpLockedUntilUtc.Value > DateTime.UtcNow)
                {
                    return StatusCode(StatusCodes.Status429TooManyRequests, $"Too many failed verification attempts. Try again after {employee.OtpLockedUntilUtc.Value:u}.");
                }

                bool usedRecoveryCode = false;
                if (!IsValidTotpCode(employee.TotpSecret, incoming.Code))
                {
                    usedRecoveryCode = TryConsumeRecoveryCode(employee, incoming.Code);
                    if (!usedRecoveryCode)
                    {
                        employee.FailedOtpAttempts += 1;
                        if (employee.FailedOtpAttempts >= MaxFailedOtpAttempts)
                        {
                            employee.OtpLockedUntilUtc = DateTime.UtcNow.AddMinutes(10);
                            employee.FailedOtpAttempts = 0;
                        }

                        await context.SaveChangesAsync();
                        return Unauthorized("Invalid verification code.");
                    }
                }

                List<string> recoveryCodes = new();
                employee.TotpEnabled = true;
                employee.FailedOtpAttempts = 0;
                employee.OtpLockedUntilUtc = null;

                if (string.IsNullOrWhiteSpace(employee.RecoveryCodesHash))
                {
                    recoveryCodes = GenerateRecoveryCodes();
                    employee.RecoveryCodesHash = HashRecoveryCodes(recoveryCodes);
                }

                await context.SaveChangesAsync();

                ClearPendingLogin();
                SetAuthenticatedSession(employee);

                return Ok(new TotpVerifyResponseDto
                {
                    EmployeeId = employee.EmployeeId,
                    EmployeeEmail = employee.EmployeeEmail,
                    EmployeeName = employee.EmployeeName,
                    BranchId = employee.BranchId,
                    EmployeeLevel = employee.EmployeeLevel,
                    RecoveryCodes = recoveryCodes,
                });
            }

            [HttpPost("logout")]
            public IActionResult Logout()
            {
                HttpContext.Session.Clear();
                ClearPendingLogin();
                return Ok(new { message = "Logged out successfully." });
            }

        #endregion
        
        #region DevFixes
        // Development-only helper to ensure the Orders table has a Status column.
        [HttpPost("dev/fix/orders-status")]
        public async Task<IActionResult> EnsureOrdersStatusColumn()
        {
            var env = HttpContext.RequestServices.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            if (env == null || !env.EnvironmentName.Equals("Development", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            try
            {
                // Use a raw SQL command to add the column if it does not exist. This is a short-lived dev helper.
                await context.Database.ExecuteSqlRawAsync("ALTER TABLE \"Orders\" ADD COLUMN IF NOT EXISTS \"Status\" text DEFAULT 'Pending';");
                return Ok(new { message = "Orders.Status column ensured" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("dev/cleanup/test-admins")]
        public async Task<IActionResult> CleanupTestAdmins()
        {
            var env = HttpContext.RequestServices.GetService(typeof(IWebHostEnvironment)) as IWebHostEnvironment;
            if (env == null || !env.EnvironmentName.Equals("Development", StringComparison.OrdinalIgnoreCase))
            {
                return Forbid();
            }

            var testAdminEmails = new[]
            {
                "localadmin@localhost",
                "localadmin@localhost.com",
                "test.user@gmail.com",
            };

            var testAdmins = await context.Employees
                .Where(employee => testAdminEmails.Contains(employee.EmployeeEmail))
                .ToListAsync();

            if (testAdmins.Count == 0)
            {
                return Ok(new { deleted = 0 });
            }

            context.Employees.RemoveRange(testAdmins);
            await context.SaveChangesAsync();

            return Ok(new { deleted = testAdmins.Count });
        }
        #endregion
        
        #region UpdateRoutes

            // summary
            // Updates the assigned branch for an existing employee.

            [HttpPatch("employee/branch")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeEmployeeBranch (string EmployeeEmail, int BranchId)
            {
                //Authentication Check
                if (!IsAdminSession())
                {
                    return Unauthorized("Update attempted by non-admin!");
                }
                
                //Check for existing employee
                var _employee = await context.Employees.FirstOrDefaultAsync(employee => employee.EmployeeEmail == EmployeeEmail);

                if (_employee == null) return NotFound($"Employee with Email: [{EmployeeEmail}] could not be found");

                //Check for existing branch
                bool _branchExists = await context.Branches.FindAsync(BranchId) != null;

                if (!_branchExists) return NotFound($"Branch with ID: [{BranchId.ToString()}] could not be found");

                //Update information
                _employee.BranchId = BranchId;
                await context.SaveChangesAsync();
                return Ok(EmployeeReadDto.ToDto(_employee));
            }


            // summary
            // Updates the profile information of an existing employee.

            [HttpPatch("employee")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeEmployeeDetails (string EmployeeEmail, EmployeeWriteDto incoming)
            {
                //Check for existing employee
                var _employee = await context.Employees.FirstOrDefaultAsync(employee => employee.EmployeeEmail == EmployeeEmail);

                if (_employee == null) return NotFound($"Employee with email: [{EmployeeEmail}] could not be found");

                //Authentication Check
                bool _isAdmin = IsAdminSession();

                if (!_isAdmin)
                {
                    return Unauthorized("Update attempted by user with incorrect credentials!");
                }

                //Update details
                _employee.EmployeeEmail = incoming.EmployeeEmail;
                _employee.EmployeeName = incoming.EmployeeName;
                // Only update password hash when a new password is provided
                if (!string.IsNullOrWhiteSpace(incoming.EmployeePassword))
                {
                    _employee.EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.EmployeePassword);
                }
                
                //Save changes
                await context.SaveChangesAsync();
                return Ok(EmployeeReadDto.ToDto(_employee));
            }
    
        #endregion

        #region DeleteRoutes
            // Permanently removes an employee from the system.
            
            [HttpDelete("employee")]
            public async Task<IActionResult> DeleteEmployee (int id)
            {
                //Authentication Check
                if (!IsAdminSession())
                {
                    return Unauthorized("Delete attempted by non-admin!");
                }
                //Check for existing admin
                var _employee = await context.Employees.FindAsync(id);
                if (_employee == null) return NotFound($"Employee with ID: {id.ToString()} could not be found");
                //Remove admin from list
                context.Employees.Remove(_employee);
                //Save changes
                await context.SaveChangesAsync();
                return NoContent();
            }
        #endregion
    }
}