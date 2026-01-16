import { ref, unref } from 'vue'

/**
 * 通用的数据获取 composable
 * 支持 GET/POST/PUT/DELETE 请求，自动错误处理和加载状态
 * 
 * @param {string | Ref<string>} url - API URL
 * @param {object} options - Fetch 选项
 * @returns {object} - { data, error, loading, execute, refetch }
 * 
 * @example
 * // 基本使用
 * const { data, error, loading, execute } = useFetch('/api/users')
 * 
 * // 延迟执行
 * const { data, execute } = useFetch('/api/users', { immediate: false })
 * 
 * // POST 请求
 * const { data, execute } = usePost('/api/users')
 * await execute({ name: 'John' })
 */
export function useFetch(url, options = {}) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const execute = async (customUrl = null, customOptions = {}) => {
    loading.value = true
    error.value = null

    try {
      const targetUrl = customUrl || unref(url)
      const fetchOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          ...customOptions.headers
        },
        ...options,
        ...customOptions
      }

      const response = await fetch(targetUrl, fetchOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      data.value = result

      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (e) {
      error.value = e
      console.error('Fetch error:', e)

      if (options.onError) {
        options.onError(e)
      }

      throw e
    } finally {
      loading.value = false
    }
  }

  const refetch = () => execute()

  // 如果 immediate 为 true, 立即执行
  if (options.immediate !== false) {
    execute()
  }

  return {
    data,
    error,
    loading,
    execute,
    refetch
  }
}

/**
 * POST 请求的简化版本
 * @example
 * const { data, execute } = usePost('/api/users')
 * await execute({ name: 'John' })
 */
export function usePost(url, options = {}) {
  return useFetch(url, {
    method: 'POST',
    ...options,
    immediate: false
  })
}

/**
 * PUT 请求的简化版本
 * @example
 * const { data, execute } = usePut('/api/users/1')
 * await execute({ name: 'Updated Name' })
 */
export function usePut(url, options = {}) {
  return useFetch(url, {
    method: 'PUT',
    ...options,
    immediate: false
  })
}

/**
 * DELETE 请求的简化版本
 * @example
 * const { data, execute } = useDelete('/api/users/1')
 * await execute()
 */
export function useDelete(url, options = {}) {
  return useFetch(url, {
    method: 'DELETE',
    ...options,
    immediate: false
  })
}
