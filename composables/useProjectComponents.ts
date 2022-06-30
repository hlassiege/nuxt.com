import type { Ref } from 'vue'
import type { Project } from '~/types'
import type { ComponentSchema } from '~/modules/editor/src/module'

export const useProjectComponents = (project: Project) => {
  const { $toast } = useNuxtApp()
  const client = useStrapiClient()

  const components: Ref<ComponentSchema[]> = useState(`project-${project.id}-components`, () => null)

  const pending = ref(false)

  // Http

  async function fetch () {
    if (!project.url) {
      return
    }

    if (components.value !== null) {
      return
    }

    pending.value = true

    try {
      let data
      if (project.url.startsWith('http://localhost') || project.url.startsWith('http://127.0.0.1')) {
        data = await $fetch(`${project.url}/api/_admin/components`, {
          retry: false,
          responseType: 'json'
        })
      } else {
        data = await client(`/projects/${project.id}/components`)
      }

      // Ensure data is valid array
      if (!Array.isArray(data)) {
        throw new TypeError('Invalid data')
      }

      components.value = data
    } catch (e) {
      components.value = []

      $toast.error({
        title: 'Could not load components',
        description: 'Make sure to install @nuxthq/admin module in your Nuxt project.'
      })
    }

    pending.value = false
  }

  return {
    // Http
    fetch,
    // Refs
    pending,
    // Data
    components
  }
}
