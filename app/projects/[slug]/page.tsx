export default function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[650px] px-8 sm:px-12 md:px-16 lg:px-20 py-16">
        <h1 className="text-fluid-4xl font-bold mb-8">Project: {params.slug}</h1>
        <p className="text-fluid-base text-gray-600 dark:text-gray-400">
          This is a placeholder page for the project. Content will be added here.
        </p>
      </div>
    </main>
  );
}
