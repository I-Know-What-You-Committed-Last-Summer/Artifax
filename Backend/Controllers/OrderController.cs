using Microsoft.AspNetCore.Mvc;
using Artifax.DTOs;
using Artifax.Models;
using Artifax.Data;

namespace Artifax.Controllers
{
    [ApiController]
    [Route("api/[Controller]")]
    public class OrderController : ControllerBase
    {
        readonly ArtifaxContext context;

        public OrderController (ArtifaxContext incoming)
        {
            context = incoming;
        }

        #region GetRoutes
        #endregion

        #region CreateRoutes
        #endregion

        #region CreateRoutes
        #endregion

        #region DeleteRoutes
        #endregion
    }
}