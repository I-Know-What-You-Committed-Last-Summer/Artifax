using Microsoft.AspNetCore.Mvc;
using Artifax.DTOs;
using Artifax.Models;
using Artifax.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using System;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class UserController : ControllerBase
    {
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

        #region GetRoutes
            //Get All Employees
            [HttpGet]
            public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAllUsers ()
            {
                return await context.Employees.Select(employee => EmployeeReadDto.ToDto(employee)).ToListAsync();
            }
            
            [HttpGet("employees")]
            public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAllEmployees ()
            {
                return await context.Employees.Where(employee => employee.EmployeeLevel == EmployeeLevels.Employee.ToString()).Select(employee => EmployeeReadDto.ToDto(employee)).ToListAsync();
            }

            [HttpGet("admins")]
            public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAllAdmins ()
            {
                return await context.Employees.Where(employee => employee.EmployeeLevel == EmployeeLevels.Admin.ToString()).Select(employee => EmployeeReadDto.ToDto(employee)).ToListAsync();
            }

            //Get All Employee by Id
            [HttpGet("employee/{email}")]
            public async Task<ActionResult<EmployeeReadDto>> GetEmployeeByEmail (string email)
            {
                var _result = await context.Employees.FirstOrDefaultAsync(employee => employee.EmployeeEmail == email);
                if (_result == null) return NotFound();
                return EmployeeReadDto.ToDto(_result);
            }

            [HttpGet("me")]
            public IActionResult GetCurrentUser()
            {
                // Check if a session exists
                var _userLevel = HttpContext.Session.GetString("UserLevel");

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
                    UserEmail = HttpContext.Session.GetString("UserEmail"),
                    Username = HttpContext.Session.GetString("Username")
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
        #endregion
        
        #region PostRoutes

            // summary
            // Registers a new employee in the system and hashes their password.

            [HttpPost("employee")]
            public async Task<ActionResult<EmployeeReadDto>> CreateEmployee (EmployeeWriteDto incoming)
            {
                //Authentication Test
                if (HttpContext.Session.GetString("UserLevel") != EmployeeLevels.Admin.ToString())
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
            public async Task<ActionResult<EmployeeReadDto>> LoginEmployee (LoginDto incoming)
            {
                //Find employee by email
                var _employee = await context.Employees.FirstOrDefaultAsync(employee => employee.EmployeeEmail == incoming.Email);
                if (_employee == null) return Unauthorized ("Employee Not Found");

                //Verify employee password
                if (!BCrypt.Net.BCrypt.Verify(incoming.Password, _employee.EmployeePasswordHash))
                {
                    return Unauthorized("Incorrect Password");
                }
                HttpContext.Session.SetString("UserLevel", _employee.EmployeeLevel);
                HttpContext.Session.SetString("UserEmail", incoming.Email);
                HttpContext.Session.SetString("Username", _employee.EmployeeName);

                return Ok(EmployeeReadDto.ToDto(_employee));
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
                if (HttpContext.Session.GetString("UserLevel") != EmployeeLevels.Admin.ToString())
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
                bool _isAdmin = HttpContext.Session.GetString("UserLevel") == EmployeeLevels.Admin.ToString();

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
                if (HttpContext.Session.GetString("UserLevel") != EmployeeLevels.Admin.ToString())
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