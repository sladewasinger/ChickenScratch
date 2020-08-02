using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using WebSocketServer.Models;
using WebSocketServer.Repositories;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebSocketServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly ImageRepository imageRepository;

        public ImageController(ImageRepository imageRepository)
        {
            this.imageRepository = imageRepository ?? throw new ArgumentNullException(nameof(imageRepository));
        }

        // GET api/<ImageController>/5
        [HttpGet]
        public IActionResult Get()
        {
            if (imageRepository.TryGet("test123", out string imageBase64))
            {
                return Ok(imageBase64);
            }
            return NotFound();
        }

        // POST api/<ImageController>
        [HttpPost]
        public IActionResult Post([FromBody] CanvasData canvasData)
        {
            imageRepository.AddOrUpdate("test123", canvasData.CanvasBase64);
            return Ok(canvasData);
        }
    }
}
