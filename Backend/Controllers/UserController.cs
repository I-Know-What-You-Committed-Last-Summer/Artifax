using Microsoft.AspNetCore.Mvc;
using Artifax.DTOs;
using Artifax.Models;
using Artifax.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class UserController : ControllerBase
    {
        const string adminLevel = "Admin";
        const string employeeLevel = "Employee";

        readonly ArtifaxContext context;

        public UserController(ArtifaxContext incoming)
        {
            context = incoming;
        }

        #region GetRoutes
            //Get All Employees
            [HttpGet("employee")]
            public async Task<ActionResult<IEnumerable<EmployeeReadDto>>> GetAllEmployees ()
            {
                return await context.Employees.Select(employee => EmployeeReadDto.ToDto(employee)).ToListAsync();
            }

            //Get All Admins
            [HttpGet("admin")]
            public async Task<ActionResult<IEnumerable<AdminReadDto>>> GetAllAdmins ()
            {
                return await context.Admins.Select(admin => AdminReadDto.ToDto(admin)).ToListAsync();
            }

            //Get All Employee by Id
            [HttpGet("employee/{id}")]
            public async Task<ActionResult<EmployeeReadDto>> GetAllEmployeeById (int id)
            {
                var _result = await context.Employees.FindAsync(id);
                if (_result == null) return NotFound();
                return EmployeeReadDto.ToDto(_result);
            }

            //Get All Admin by Id
            [HttpGet("admin/{id}")]
            public async Task<ActionResult<AdminReadDto>> GetAllAdminById (int id)
            {
                var _result = await context.Admins.FindAsync(id);
                if (_result == null) return NotFound();
                return AdminReadDto.ToDto(_result);
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
        
        #region PostRoutes
            [HttpPost("employee")]
            public async Task<ActionResult<EmployeeReadDto>> CreateEmployee (EmployeeWriteDto incoming)
            {
                //Authentication Test
                if (HttpContext.Session.GetString("UserLevel") != adminLevel)
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
                    EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.EmployeePassword)
                };

                //Save new employee to database
                context.Employees.Add(_employee);
                await context.SaveChangesAsync();

                //Convert new employee to Read DTO using static function in EmployeeReadDto class
                EmployeeReadDto _dto = EmployeeReadDto.ToDto(_employee);

                return CreatedAtAction("GetAllEmployeeById", new { id = _employee.EmployeeId}, _dto);
            }

            [HttpPost("admin")]
            public async Task<ActionResult<AdminReadDto>> CreateAdmin (AdminWriteDto incoming)
            {
                //Authentication Test
                if (HttpContext.Session.GetString("UserLevel") != adminLevel)
                {
                    return Unauthorized("Creation attempted by non-admin!");
                }

                //Check whether admin with incoming details already exists to prevent duplicate emails for login
                var _testAdmin = await context.Admins.FirstOrDefaultAsync(admin => admin.AdminEmail == incoming.AdminEmail);
                
                if (_testAdmin != null) return Unauthorized ("Email Already Exists");

                //Creates new admin from incoming details
                Admin _admin = new ()
                {
                    AdminEmail = incoming.AdminEmail,
                    AdminName = incoming.AdminName,
                    AdminPasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.AdminPassword)
                };

                //Save new admin to database
                context.Admins.Add(_admin);
                await context.SaveChangesAsync();

                //Convert new admin to Read DTO using static function in AdminReadDto class
                AdminReadDto _dto = AdminReadDto.ToDto(_admin);

                return CreatedAtAction("GetAllAdminById", new { id = _admin.AdminId}, _dto);
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
                HttpContext.Session.SetString("UserLevel", employeeLevel);
                HttpContext.Session.SetString("UserEmail",incoming.Email);
                HttpContext.Session.SetString("Username", _employee.EmployeeName);

                return Ok(EmployeeReadDto.ToDto(_employee));
            }

            [HttpPost("admins/login")]
            public async Task<ActionResult<AdminReadDto>> LoginAdmin (LoginDto incoming)
            {
                //Find admin by email
                var _admin = await context.Admins.FirstOrDefaultAsync(admin => admin.AdminEmail == incoming.Email);
                if (_admin == null) return Unauthorized ("Admin Not Found");

                //Verify admin password
                if (!BCrypt.Net.BCrypt.Verify(incoming.Password, _admin.AdminPasswordHash))
                {
                    return Unauthorized("Incorrect Password");
                }
                HttpContext.Session.SetString("UserLevel",adminLevel);
                HttpContext.Session.SetString("UserEmail",incoming.Email);
                HttpContext.Session.SetString("Username", _admin.AdminName);
                
                return Ok(AdminReadDto.ToDto(_admin));
            }
        #endregion
        
        #region UpdateRoutes
            [HttpPatch("employee/branch")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeEmployeeBranch (int EmployeeId, int BranchId)
            {
                //Authentication Check
                if (HttpContext.Session.GetString("UserLevel") != adminLevel)
                {
                    return Unauthorized("Update attempted by non-admin!");
                }
                
                //Check for existing employee
                var _employee = await context.Employees.FindAsync(EmployeeId);

                if (_employee == null) return NotFound($"Employee with ID: {EmployeeId.ToString()} could not be found");

                //Check for existing branch
                bool _branchExists = await context.Branches.FindAsync(BranchId) != null;

                if (!_branchExists) return NotFound($"Branch with ID: {BranchId.ToString()} could not be found");

                //Update information
                _employee.BranchId = BranchId;
                await context.SaveChangesAsync();
                return Ok(EmployeeReadDto.ToDto(_employee));
            }

            [HttpPatch("employee")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeEmployeeDetails (int id, EmployeeWriteDto incoming)
            {
                //Check for existing employee
                var _employee = await context.Employees.FindAsync(id);

                if (_employee == null) return NotFound($"Employee with ID: {id.ToString()} could not be found");

                //Authentication Check
                bool _isAdmin = HttpContext.Session.GetString("UserLevel") == adminLevel;

                if (!_isAdmin)
                {
                    return Unauthorized("Update attempted by user with incorrect credentials!");
                }

                //Update details
                _employee.EmployeeEmail = incoming.EmployeeEmail;
                _employee.EmployeeName = incoming.EmployeeName;
                _employee.EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.EmployeePassword);
                
                //Save changes
                await context.SaveChangesAsync();
                return Ok(EmployeeReadDto.ToDto(_employee));
            }

            [HttpPatch("admin")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeAdminDetails (int id, AdminWriteDto incoming)
            {

                //Check for existing admin
                var _admin = await context.Admins.FindAsync(id);

                if (_admin == null) return NotFound($"Admin with ID: {id.ToString()} could not be found");

                //Authentication Check
                if (HttpContext.Session.GetString("UserLevel") != adminLevel || HttpContext.Session.GetString("UserEmail") != _admin.AdminEmail)
                {
                    return Unauthorized("Update attempted by user with incorrect credentials!");
                }

                //Update details
                _admin.AdminEmail = incoming.AdminEmail;
                _admin.AdminName = incoming.AdminName;
                _admin.AdminPasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.AdminPassword);

                //Save changes
                await context.SaveChangesAsync();
                return Ok(AdminReadDto.ToDto(_admin));
            }
        #endregion

        #region DeleteRoutes
            [HttpDelete("admin")]
            public async Task<IActionResult> DeleteAdmin (int id)
            {
                //Check for existing admin
                var _admin = await context.Admins.FindAsync(id);
                if (_admin == null) return NotFound($"Admin with ID: {id.ToString()} could not be found");
                //Authentication Check
                if (HttpContext.Session.GetString("UserLevel") != adminLevel)
                {
                    return Unauthorized("Delete attempted by non-admin!");
                }
                //Remove admin from list
                context.Admins.Remove(_admin);
                //Save changes
                await context.SaveChangesAsync();

                //Clear Session Cookie is Admin deleting self
                if (HttpContext.Session.GetString("UserEmail") == _admin.AdminEmail) HttpContext.Session.Clear();

                return NoContent();
            }

            [HttpDelete("employee")]
            public async Task<IActionResult> DeleteEmployee (int id)
            {
                //Authentication Check
                if (HttpContext.Session.GetString("UserLevel") != adminLevel)
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