import projectData from "./projects.json"
import { HostingType } from "./hosting-type"
import githubData from "./projects-github.json"

import { RestEndpointMethodTypes } from "@octokit/rest"
import { z } from "zod"
import { PricingModel } from "./pricing-model"

export const feature = z.object({
  name: z.string(),
  description: z.string().optional(),
  value: z.string().optional(),
})

export const featureGroup = z.object({
  name: z.string(),
  features: z.array(feature),
})

export const isNotSelfHosted = (project: ProjectMeta) => {
  return project.hostingType === HostingType.CloudOnly || project.pricingModel === PricingModel.PaidOnly
}

export const mdxProjectData = z
  .object({
    filePath: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string(),

    license: z.string().optional(),
    hostingType: z.nativeEnum(HostingType).optional(),
    pricingModel: z.nativeEnum(PricingModel).optional(),

    logo: z.string().optional(),
    heroImage: z.string().optional(),

    category: z.string(),
    tags: z.array(z.string()),

    github: z
      .string()
      .regex(/^[^/]+\/[^/]+$/)
      .optional(),

    urls: z
      .object({
        website: z.string().url().optional(),
        demo: z.string().url().optional(),
        discord: z.string().url().optional(),
        unraidApp: z.string().url().optional(),
      })
      .optional(),

    alternatives: z.object({
      selfHosted: z.array(z.string()).optional(),
      nonSelfHosted: z.array(z.string()).optional(),
    }),
    deployment: z
      .object({
        difficulty: z.enum(["Easy", "Medium", "Advanced"]),
        justification: z.string(),
        docker: z.boolean().optional(), // Whether Docker deployment is supported
        dockerCompose: z.boolean().optional(), // Whether docker-compose deployment is supported
      })
      .optional(),

    systemRequirements: z
      .object({
        databases: z.array(z.string()).optional(), // e.g. ["postgresql", "mysql"]
        storage: z.array(z.string()).optional(), // e.g. ["s3", "local"]
        cache: z.array(z.string()).optional(), // e.g. ["redis", "memcached"]
        search: z.array(z.string()).optional(), // e.g. ["elasticsearch", "meilisearch"]
        other: z.array(z.string()).optional(), // e.g. ["ffmpeg", "imagemagick"]
      })
      .passthrough()
      .optional(),

    popularity: z.number().optional(),
    language: z.string().optional(),
    techStack: z.array(z.string()).optional(),

    featureGroups: z.array(featureGroup).optional(),
  })
  .passthrough()

export type ProjectMeta = z.infer<typeof mdxProjectData>

export const githubProjectData = z.object({
  lastCommitDate: z.string().transform((str) => new Date(str)),
  languages: z.record(z.string(), z.number()),
  stars: z.number(),
  forks: z.number(),
  watchers: z.number(),
  issues: z.number(),
})

export const projects = projectData as unknown as Array<ProjectMeta>
export const projectsWithGitHubData = githubData as unknown as Record<
  string,
  {
    lastCommitDate: string
    languages: Record<string, number>
  } & RestEndpointMethodTypes["repos"]["get"]["response"]["data"]
>

/**
 * Computes a popularity score for a project based on GitHub metrics
 * Higher score means more popular
 */
export const getProjectPopularity = (slug: string): number => {
  const project = projects.find((p) => p.slug === slug)
  if (project?.popularity) return project.popularity

  const githubData = projectsWithGitHubData[slug]
  if (!githubData || !project) return 0

  // Weight different factors that contribute to popularity
  const weights = {
    stars: 0.4, // 40% weight for stars
    forks: 0.2, // 20% weight for forks
    watchers: 0.15, // 15% weight for watchers
    issues: 0.1, // 10% weight for open issues
    lastCommit: 0.2, // 20% weight for recency
  }

  const scores = {
    stars: githubData.stargazers_count || 0,
    forks: githubData.forks || 0,
    watchers: githubData.subscribers_count || 0,
    issues: githubData.open_issues || 0,
    lastCommit: githubData.lastCommitDate
      ? Math.max(
          0,
          Math.exp(-((Date.now() - new Date(githubData.lastCommitDate).getTime()) / (30 * 24 * 60 * 60 * 1000)))
        )
      : 0,
  }

  // Calculate weighted score and scale to 0-100
  const score =
    Object.entries(weights).reduce((total, [metric, weight]) => {
      return total + scores[metric as keyof typeof scores] * weight
    }, 0) / 100

  return Math.round(score)
}

export const getProjectLogo = (slug: string): string | undefined => {
  const project = projects.find((p) => p.slug === slug)
  if (project?.logo) return project.logo

  const githubData = projectsWithGitHubData[slug]
  if (!githubData || !project) return undefined

  return githubData.owner.avatar_url
}
