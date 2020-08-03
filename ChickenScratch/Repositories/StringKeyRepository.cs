using System.Collections.Concurrent;
using System.Collections.Generic;

namespace ChickenScratch.Repositories
{
    public abstract class StringKeyRepository<T>
    {
        private ConcurrentDictionary<string, T> concurrentDictionary = new ConcurrentDictionary<string, T>();

        public T AddOrUpdate(string key, T value)
        {
            return concurrentDictionary.AddOrUpdate(key, value, (key, oldValue) => value);
        }

        public bool TryGet(string key, out T value)
        {
            return concurrentDictionary.TryGetValue(key, out value);
        }

        public bool TryRemove(string key, out T value)
        {
            return concurrentDictionary.TryRemove(key, out value);
        }

        public IEnumerable<T> GetAll()
        {
            return concurrentDictionary.Values;
        }
    }
}
