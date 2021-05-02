using System.Linq;

namespace ChickenScratch.Extensions
{
    public static class LobbyExtensions
    {
        public static string GenerateKey()
        {
            char[] characters = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789".ToCharArray();
            return new string(Enumerable.Repeat(characters, 4).Select(s => s[StaticRandom.Random.Next(0, characters.Length)]).ToArray());
        }
    }
}
