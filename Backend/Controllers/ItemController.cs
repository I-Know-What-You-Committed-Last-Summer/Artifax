using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Artifax.Models;
using Artifax.Data;
using Artifax.DTOs;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class ItemController : ControllerBase
    {
        private readonly ArtifaxContext _context;
        public ItemController(ArtifaxContext context)
        {
            _context = context;
        }

        

    }
}