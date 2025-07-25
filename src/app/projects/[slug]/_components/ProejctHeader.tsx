import React from "react"
import { badgeVariants } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Star, Shield, CheckCircle, AlertCircle, Clock, GitFork, Eye, Github, Globe, Play } from "lucide-react"
import { getProjectLogo, getProjectPopularity, ProjectMeta, projects, projectsWithGitHubData } from "@/lib/projects"
import { SiDiscord, SiUnraid } from "@icons-pack/react-simple-icons"
import Link from "next/link"
import { pricingModelInfo } from "@/lib/pricing-model"
import { hostingTypeInfo } from "@/lib/hosting-type"
import { isPresent } from "ts-is-present"

const difficultyIcons = {
  Easy: <CheckCircle className="w-4 h-4" />,
  Medium: <AlertCircle className="w-4 h-4" />,
  Advanced: <Shield className="w-4 h-4" />,
}

export const ProjectHeader: React.FC<ProjectMeta> = (project) => {
  const githubData = projectsWithGitHubData[project.slug]

  const language = project.language ?? githubData?.language

  const nonSelfHostedAlternatives =
    project.alternatives.nonSelfHosted
      ?.filter((alternative) => alternative !== project.slug)
      .map((alternative) => projects.find((p) => p.slug.toLowerCase() === alternative.toLowerCase()))
      .filter(isPresent) ?? []

  const selfHostedAlternatives =
    project.alternatives.selfHosted
      ?.filter((alternative) => alternative !== project.slug)
      .map((alternative) => projects.find((p) => p.slug.toLowerCase() === alternative.toLowerCase()))
      .filter(isPresent)
      .sort((a, b) => {
        const popularityA = getProjectPopularity(a.slug)
        const popularityB = getProjectPopularity(b.slug)
        return popularityB - popularityA
      })
      .slice(0, 5) ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 items-center">
          <img src={getProjectLogo(project.slug)} alt={project.name} className="object-cover rounded-lg w-10 h-10" />
          <h1 className="text-3xl font-bold">{project.name}</h1>
        </div>
        <div className="flex gap-2">
          {project.github && (
            <a
              href={`https://github.com/${project.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          )}
          {project.urls?.website && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href={project.urls?.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            </>
          )}
          {project.urls?.discord && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href={project.urls?.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                <SiDiscord className="w-4 h-4" />
                Discord
              </a>
            </>
          )}

          {project.urls?.demo && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href={project.urls?.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                <Play className="w-4 h-4" />
                Demo
              </a>
            </>
          )}

          {project.urls?.unraidApp && (
            <>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <a
                href={project.urls?.unraidApp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
              >
                <SiUnraid className="w-4 h-4" />
                Unraid Support
              </a>
            </>
          )}
        </div>
      </div>

      <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">{project.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
        <div className="space-y-4">
          {nonSelfHostedAlternatives.length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold">Self-hosted alternatives to:</div>
              <div className="flex flex-wrap gap-2">
                {nonSelfHostedAlternatives.map((project) => (
                  <Link
                    href={`/projects/${project.slug}`}
                    key={project.slug}
                    className={badgeVariants({
                      variant: "outline",
                      className: "text-sm flex items-center gap-2",
                    })}
                  >
                    <img src={getProjectLogo(project.slug)} alt={project?.name} className="rounded-full w-4 h-4" />
                    {project?.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="font-semibold">Similar self-hosted alternatives:</div>
            <div className="flex flex-wrap gap-2">
              {selfHostedAlternatives.length > 0 ? (
                selfHostedAlternatives.map((project) => {
                  return (
                    <Link
                      href={`/projects/${project.slug}`}
                      key={project.slug}
                      className={badgeVariants({
                        variant: "secondary",
                        className: "text-sm flex items-center gap-2",
                      })}
                    >
                      <img src={getProjectLogo(project.slug)} alt={project?.name} className="rounded-full w-4 h-4" />
                      {project?.name}
                    </Link>
                  )
                })
              ) : (
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">None found</span>
              )}
            </div>
          </div>
        </div>

        {githubData && (
          <div className="space-y-2">
            <div className="font-semibold">Repository activity:</div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                Stars
              </div>

              <div className="border-t flex-grow" />
              <span className="font-medium">{githubData.stargazers_count?.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4 text-green-500" />
                Forks
              </div>

              <div className="border-t flex-grow" />
              <span className="font-medium">{githubData.forks?.toLocaleString() ?? 0}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-purple-500" />
                Watchers
              </div>

              <div className="border-t flex-grow" />
              <span className="font-medium">{githubData.subscribers_count?.toLocaleString() ?? 0}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Open Issues
              </div>

              <div className="border-t flex-grow" />
              <span className="font-medium">{githubData.open_issues_count?.toLocaleString() ?? 0}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                Last commit
              </div>

              <div className="border-t flex-grow" />
              <span className="font-medium">
                {githubData.lastCommitDate
                  ? formatDistanceToNow(new Date(githubData.lastCommitDate), {
                      addSuffix: true,
                    })
                  : "Unknown"}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="font-semibold">Details:</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>Estimated Popularity</span>
            </div>

            <div className="border-t flex-grow" />
            <span className="font-medium">{getProjectPopularity(project.slug).toLocaleString()}</span>
          </div>

          {project.pricingModel && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>Pricing Model</span>
              </div>

              <div className="border-t flex-grow" />
              <span
                className={`font-medium px-2 py-0.5 rounded-full text-sm ${
                  pricingModelInfo[project.pricingModel].color
                }`}
              >
                {project.pricingModel}
              </span>
            </div>
          )}

          {project.hostingType && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>Hosting Type</span>
              </div>

              <div className="border-t flex-grow" />
              <span
                className={`font-medium px-2 py-0.5 rounded-full text-sm ${hostingTypeInfo[project.hostingType].color}`}
              >
                {project.hostingType}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span>License</span>
            </div>

            <div className="border-t flex-grow" />
            <span className="font-medium">{project.license ?? githubData?.license?.spdx_id ?? "Proprietary"}</span>
          </div>
          {project.deployment && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>Deployment Difficulty</span>
              </div>

              <div className="border-t flex-grow" />
              <span className="font-medium flex items-center gap-1">
                {difficultyIcons[project.deployment.difficulty]}
                <span>{project.deployment.difficulty}</span>
              </span>
            </div>
          )}
          {language && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>Language</span>
              </div>

              <div className="border-t flex-grow" />
              <span className="font-medium">{project.language ?? githubData?.language ?? "Unknown"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
