#include "ThreadPool.h"

// Constructor: creates a fixed number of worker threads
ThreadPool::ThreadPool(size_t numThreads) : m_stop(false) {
    m_workers.reserve(numThreads);

    // Launch worker threads
    for (size_t i = 0; i < numThreads; ++i) {
        m_workers.emplace_back([this]() {
            workerLoop();
        });
    }
}

// Destructor: shuts down the pool and waits for all workers to finish
ThreadPool::~ThreadPool() {
    shutdown();
}

// Submit a new task to the task queue
void ThreadPool::submit(std::function<void()> task) {
    {
        std::lock_guard<std::mutex> lock(m_queueMutex);
        if (m_stop) {
            return; // Do not accept new tasks after shutdown
        }
        m_tasks.push(std::move(task));
    }

    // Wake up one worker thread
    m_condition.notify_one();
}

// Signals all workers to stop and waits for them to exit
void ThreadPool::shutdown() {
    {
        std::lock_guard<std::mutex> lock(m_queueMutex);
        if (m_stop) {
            return; // Shutdown already performed
        }
        m_stop = true;
    }

    // Wake up all workers so they can exit
    m_condition.notify_all();

    // Join all worker threads
    for (std::thread& worker : m_workers) {
        if (worker.joinable()) {
            worker.join();
        }
    }
}

// Main execution loop run by each worker thread
void ThreadPool::workerLoop() {
    while (true) {
        std::function<void()> task;

        {
            std::unique_lock<std::mutex> lock(m_queueMutex);

            // Wait until there is a task to process or shutdown is requested
            m_condition.wait(lock, [this]() {
                return m_stop || !m_tasks.empty();
            });

            // Exit condition: shutdown requested and no remaining tasks
            if (m_stop && m_tasks.empty()) {
                return;
            }

            // Retrieve next task from the queue
            task = std::move(m_tasks.front());
            m_tasks.pop();
        }

        // Execute the task outside the critical section
        task();
    }
}
