﻿using System;

namespace ChickenScratch.Extensions
{
    public static class StaticRandom
    {
        public static readonly Random Random = new Random("seed".GetHashCode());
    }
}
