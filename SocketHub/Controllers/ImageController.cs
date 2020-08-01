using Microsoft.AspNetCore.Mvc;
using System.Linq;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebSocketServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        // GET api/<ImageController>/5
        [HttpGet]
        public IActionResult Get()
        {
            ImageRepository.ImageBag.TryPeek(out string result);
            return Ok(result);
        }

        // POST api/<ImageController>
        [HttpPost]
        public IActionResult Post([FromBody] CanvasData canvasData)
        {
            ImageRepository.ImageBag.Push(canvasData.CanvasBase64);
            return Ok(canvasData);
        }
    }
}
