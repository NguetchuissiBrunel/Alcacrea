import { defineConfig } from '@openapi-codegen/cli'
import { generateFetchers, generateSchemaTypes } from '@openapi-codegen/typescript'

export default defineConfig({
  medicalBackend: {
    from: {
      source: 'file',
      relativePath: './openapi/medical-backend.json',
    },
    outputDir: 'src/api/generated',
    to: async (context) => {
      const filenamePrefix = 'medicalBackend'

      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      })

      await generateFetchers(context, {
        filenamePrefix,
        schemasFiles,
        baseUrl: 'https://parser.datapipe.duckdns.org',
      })
    },
  },
})
