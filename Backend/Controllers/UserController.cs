using Microsoft.AspNetCore.Mvc;
using Artifax.DTOs;
using Artifax.Models;
using Artifax.Data;
using Microsoft.EntityFrameworkCore;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class UserController : ControllerBase
    {
        //TODO: Add Session Based Auth
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
        #endregion
        
        #region PostRoutes

            // summary
            // Registers a new employee in the system and hashes their password.

            [HttpPost("employee")]
            public async Task<ActionResult<EmployeeReadDto>> CreateEmployee (EmployeeWriteDto incoming)
            {
                //FIXME: Auth

                //Check whether employee with incoming details already exists to prevent duplicate emails for login
                bool _employeeNotFound = await context.Admins.FindAsync(incoming.EmployeeEmail) == null;
                if (_employeeNotFound) return Unauthorized ("Email Already Exists");

                //Creates new employee from incoming details
                Employee _employee = new ()
                {
                    BranchId = 0,
                    EmployeeEmail = incoming.EmployeeEmail,
                    EmployeeId = context.Employees.Max(employee => employee.EmployeeId + 1),
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


            // summary
            // Registers a new administrator in the system and hashes their password.
            
            [HttpPost("admin")]
            public async Task<ActionResult<AdminReadDto>> CreateAdmin (AdminWriteDto incoming)
            {
                //FIXME: Auth

                //Check whether admin with incoming details already exists to prevent duplicate emails for login
                bool _adminNotFound = await context.Admins.FindAsync(incoming.AdminEmail) == null;
                if (_adminNotFound) return Unauthorized ("Email Already Exists");

                //Creates new admin from incoming details
                Admin _admin = new ()
                {
                    AdminEmail = incoming.AdminEmail,
                    AdminId = context.Admins.Max(_i => _i.AdminId + 1),
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


            // summary
            // Authenticates an employee based on their email and password credentials. 

            [HttpPost("employees/login")]
            public async Task<ActionResult<EmployeeReadDto>> LoginEmployee (string email, string password)
            {
                //Find employee by email
                var _employee = await context.Employees.FirstOrDefaultAsync(employee => employee.EmployeeEmail == email);
                if (_employee == null) return Unauthorized ("Employee Not Found");

                //Verify employee password
                if (!BCrypt.Net.BCrypt.Verify(password, _employee.EmployeePasswordHash))
                {
                    return Unauthorized("Incorrect Password");
                }

                return Ok(EmployeeReadDto.ToDto(_employee));
            }


            // summary
            // Authenticates an administrator based on their email and password credentials. 

            [HttpPost("admins/login")]
            public async Task<ActionResult<AdminReadDto>> LoginAdmin (string email, string password)
            {
                //Find admin by email
                var _admin = await context.Admins.FirstOrDefaultAsync(admin => admin.AdminEmail == email);
                if (_admin == null) return Unauthorized ("Admin Not Found");

                //Verify admin password
                if (!BCrypt.Net.BCrypt.Verify(password, _admin.AdminPasswordHash))
                {
                    return Unauthorized("Incorrect Password");
                }

                return Ok(AdminReadDto.ToDto(_admin));
            }
        #endregion
        
        #region UpdateRoutes

            // summary
            // Updates the assigned branch for an existing employee.

            [HttpPatch("employee/branch")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeEmployeeBranch (int EmployeeId, int BranchId)
            {
                //FIXME: Auth

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


            // summary
            // Updates the profile information of an existing employee.

            [HttpPatch("employee")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeEmployeeDetails (int id, EmployeeWriteDto incoming)
            {
                //FIXME: Auth

                //Check for existing employee
                var _employee = await context.Employees.FindAsync(id);

                if (_employee == null) return NotFound($"Employee with ID: {id.ToString()} could not be found");

                //Update details
                _employee.EmployeeEmail = incoming.EmployeeEmail;
                _employee.EmployeeName = incoming.EmployeeName;
                _employee.EmployeePasswordHash = BCrypt.Net.BCrypt.HashPassword(incoming.EmployeePassword);
                
                //Save changes
                await context.SaveChangesAsync();
                return Ok(EmployeeReadDto.ToDto(_employee));
            }


            // summary
            // Updates the profile information of an existing administrator.

            [HttpPatch("admin")]
            public async Task<ActionResult<EmployeeReadDto>> ChangeAdminDetails (int id, AdminWriteDto incoming)
            {
                //FIXME: Auth

                //Check for existing admin
                var _admin = await context.Admins.FindAsync(id);

                if (_admin == null) return NotFound($"Admin with ID: {id.ToString()} could not be found");

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

            // summary
            // Permanently removes an administrator from the system.
            [HttpDelete("admin")]
            public async Task<IActionResult> DeleteAdmin (int id)
            {
                //Check for existing admin
                var _admin = await context.Admins.FindAsync(id);
                if (_admin == null) return NotFound($"Admin with ID: {id.ToString()} could not be found");
                //Remove admin from list
                context.Admins.Remove(_admin);
                //Save changes
                await context.SaveChangesAsync();
                return NoContent();
            }


            // summary
            // Permanently removes an employee from the system.
            
            [HttpDelete("employee")]
            public async Task<IActionResult> DeleteEmployee (int id)
            {
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