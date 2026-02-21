import Card from '@/components/ui/Card'

export default function MaterialsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Materiales</h1>
      <Card>
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-4">📚</div>
          <p className="font-medium text-gray-600 text-lg">Próximamente</p>
          <p className="text-sm mt-2">Los materiales de estudio estarán disponibles pronto</p>
        </div>
      </Card>
    </div>
  )
}
