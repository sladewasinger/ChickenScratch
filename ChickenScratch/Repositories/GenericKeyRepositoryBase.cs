using System.Collections.Concurrent;
using System.Collections.Generic;

namespace ChickenScratch.Repositories
{
    public abstract class GenericKeyRepositoryBase<TKey, TData>
    {
        private ConcurrentDictionary<TKey, TData> concurrentDictionary = new ConcurrentDictionary<TKey, TData>();

        public TData AddOrUpdate(TKey key, TData value)
        {
            return concurrentDictionary.AddOrUpdate(key, value, (key, oldValue) => value);
        }

        public bool TryGet(TKey key, out TData value)
        {
            return concurrentDictionary.TryGetValue(key, out value);
        }

        public bool TryRemove(TKey key, out TData value)
        {
            return concurrentDictionary.TryRemove(key, out value);
        }

        public IEnumerable<TData> GetAll()
        {
            return concurrentDictionary.Values;
        }
    }
}
