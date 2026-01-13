#ifndef THREAD_POOL_H
#define THREAD_POOL_H

#include <vector>
#include <thread>
#include <queue>
#include <functional> // Allows storing and executing generic callable tasks (e.g., lambdas, functions) in the thread pool
#include <mutex>
#include <condition_variable> // Allows worker threads to sleep efficiently and wake up only when new tasks are available


class ThreadPool {
public:
    // Create a thread pool with a fixed number of worker threads
    explicit ThreadPool(size_t numThreads);

    // Gracefully stop the pool and join all threads
    ~ThreadPool();

    // Submit a new task to be executed by the pool
    void submit(std::function<void()> task);

private:
    // Worker threads
    std::vector<std::thread> m_workers;

    // Task queue
    std::queue<std::function<void()>> m_tasks;

    // Synchronization
    std::mutex m_queueMutex;
    std::condition_variable m_condition;

    // Shutdown flag shared between threads; synchronized via mutex to avoid race conditions
    bool m_stop; 

    // Main loop executed by each worker thread
    void workerLoop();

     // Gracefully stop all workers and release resources
    void shutdown();
};

#endif // THREAD_POOL_H
