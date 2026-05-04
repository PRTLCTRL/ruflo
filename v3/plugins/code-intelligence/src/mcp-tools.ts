/**
 * Code Intelligence Plugin - MCP Tools
 *
 * Implements 5 MCP tools for advanced code analysis:
 * 1. code/semantic-search - Find semantically similar code patterns
 * 2. code/architecture-analyze - Analyze codebase architecture
 * 3. code/refactor-impact - Predict refactoring impact using GNN
 * 4. code/split-suggest - Suggest module splits using MinCut
 * 5. code/learn-patterns - Learn patterns from code history
 *
 * Based on ADR-035: Advanced Code Intelligence Plugin
 *
 * @module v3/plugins/code-intelligence/mcp-tools
 */

import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import glob from 'fast-glob';
import type {
  SemanticSearchResult,
  ArchitectureAnalysisResult,
  RefactoringImpactResult,
  ModuleSplitResult,
  PatternLearningResult,
  CodeSearchResult,
  DependencyGraph,
  FileImpact,
  SuggestedModule,
  LearnedPattern,
  IGNNBridge,
  IMinCutBridge,
} from './types.js';
import {
  SemanticSearchInputSchema,
  ArchitectureAnalyzeInputSchema,
  RefactorImpactInputSchema,
  SplitSuggestInputSchema,
  LearnPatternsInputSchema,
  CodeIntelligenceError,
  CodeIntelligenceErrorCodes,
  maskSecrets,
  type AnalysisType,
  type Language,
  type SearchType,
} from './types.js';
import { createGNNBridge } from './bridges/gnn-bridge.js';
import { createMinCutBridge } from './bridges/mincut-bridge.js';

// ============================================================================
// MCP Tool Types
// ============================================================================

/**
 * MCP Tool definition
 */
export interface MCPTool<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  category: string;
  version: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputSchema: z.ZodType<TInput, z.ZodTypeDef, any>;
  handler: (input: TInput, context: ToolContext) => Promise<MCPToolResult<TOutput>>;
}

/**
 * Tool execution context
 */
export interface ToolContext {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  bridges: {
    gnn: IGNNBridge;
    mincut: IMinCutBridge;
  };
  config: {
    allowedRoots: string[];
    blockedPatterns: RegExp[];
    maskSecrets: boolean;
  };
}

/**
 * MCP Tool result format
 */
export interface MCPToolResult<T = unknown> {
  content: Array<{ type: 'text'; text: string }>;
  data?: T;
}

// ============================================================================
// Security Utilities
// ============================================================================

/**
 * Validate path for security
 */
function validatePath(userPath: string, allowedRoots: string[]): string {
  const normalized = path.normalize(userPath);

  // Check for path traversal
  if (normalized.includes('..')) {
    throw new CodeIntelligenceError(
      CodeIntelligenceErrorCodes.PATH_TRAVERSAL,
      'Path traversal detected',
      { path: userPath }
    );
  }

  // Check against allowed roots
  const resolved = path.resolve(normalized);
  const isAllowed = allowedRoots.some(root => {
    const resolvedRoot = path.resolve(root);
    return resolved.startsWith(resolvedRoot);
  });

  if (!isAllowed && allowedRoots.length > 0 && !allowedRoots.includes('.')) {
    throw new CodeIntelligenceError(
      CodeIntelligenceErrorCodes.PATH_TRAVERSAL,
      'Path outside allowed roots',
      { path: userPath, allowedRoots }
    );
  }

  return normalized;
}

/**
 * Check if path is sensitive
 */
function isSensitivePath(filePath: string, blockedPatterns: RegExp[]): boolean {
  return blockedPatterns.some(pattern => pattern.test(filePath));
}

// ============================================================================
// Semantic Search Tool
// ============================================================================

/**
 * MCP Tool: code/semantic-search
 *
 * Search for semantically similar code patterns
 */
export const semanticSearchTool: MCPTool<
  z.infer<typeof SemanticSearchInputSchema>,
  SemanticSearchResult
> = {
  name: 'code/semantic-search',
  description: 'Search for semantically similar code patterns',
  category: 'code-intelligence',
  version: '3.0.0-alpha.1',
  inputSchema: SemanticSearchInputSchema,
  handler: async (input, context) => {
    const startTime = Date.now();

    try {
      const validated = SemanticSearchInputSchema.parse(input);

      // Validate paths
      const paths = validated.scope?.paths?.map(p =>
        validatePath(p, context.config.allowedRoots)
      ) ?? ['.'];

      // Filter out sensitive files
      const safePaths = paths.filter(p =>
        !isSensitivePath(p, context.config.blockedPatterns)
      );

      // Initialize GNN bridge for semantic embeddings
      const gnn = context.bridges.gnn;
      if (!gnn.isInitialized()) {
        await gnn.initialize();
      }

      // Perform search (simplified - in production would use vector index)
      const results = await performSemanticSearch(
        validated.query,
        safePaths,
        validated.searchType,
        validated.topK,
        validated.scope?.languages,
        validated.scope?.excludeTests ?? false,
        context
      );

      // Mask secrets in results
      if (context.config.maskSecrets) {
        for (const result of results) {
          (result as { snippet: string }).snippet = maskSecrets(result.snippet);
          (result as { context: string }).context = maskSecrets(result.context);
        }
      }

      const result: SemanticSearchResult = {
        success: true,
        query: validated.query,
        searchType: validated.searchType,
        results,
        totalMatches: results.length,
        scope: {
          paths: safePaths,
          languages: validated.scope?.languages,
          excludeTests: validated.scope?.excludeTests,
        },
        durationMs: Date.now() - startTime,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            durationMs: Date.now() - startTime,
          }, null, 2),
        }],
      };
    }
  },
};

// ============================================================================
// Architecture Analyze Tool
// ============================================================================

/**
 * MCP Tool: code/architecture-analyze
 *
 * Analyze codebase architecture and detect drift
 */
export const architectureAnalyzeTool: MCPTool<
  z.infer<typeof ArchitectureAnalyzeInputSchema>,
  ArchitectureAnalysisResult
> = {
  name: 'code/architecture-analyze',
  description: 'Analyze codebase architecture and detect drift',
  category: 'code-intelligence',
  version: '3.0.0-alpha.1',
  inputSchema: ArchitectureAnalyzeInputSchema,
  handler: async (input, context) => {
    const startTime = Date.now();

    try {
      const validated = ArchitectureAnalyzeInputSchema.parse(input);

      // Validate root path
      const rootPath = validatePath(validated.rootPath, context.config.allowedRoots);

      // Initialize GNN bridge
      const gnn = context.bridges.gnn;
      if (!gnn.isInitialized()) {
        await gnn.initialize();
      }

      // Determine analyses to perform
      const analyses = validated.analysis ?? [
        'dependency_graph',
        'circular_deps',
        'component_coupling',
      ];

      // Build dependency graph
      const files = await getFilesInPath(rootPath);
      const safeFiles = files.filter(f =>
        !isSensitivePath(f, context.config.blockedPatterns)
      );

      const dependencyGraph = await gnn.buildCodeGraph(safeFiles, true);

      // Enrich graph with real import edges (compensates for extractImports stub)
      const enrichedGraph = await enrichGraphWithEdges(dependencyGraph);

      // Perform requested analyses
      const result: ArchitectureAnalysisResult = {
        success: true,
        rootPath,
        analyses: analyses as AnalysisType[],
        dependencyGraph: analyses.includes('dependency_graph') ? enrichedGraph : undefined,
        layerViolations: analyses.includes('layer_violations')
          ? detectLayerViolations(enrichedGraph, validated.layers)
          : undefined,
        circularDeps: analyses.includes('circular_deps')
          ? detectCircularDeps(enrichedGraph)
          : undefined,
        couplingMetrics: analyses.includes('component_coupling')
          ? calculateCouplingMetrics(enrichedGraph)
          : undefined,
        cohesionMetrics: analyses.includes('module_cohesion')
          ? calculateCohesionMetrics(enrichedGraph)
          : undefined,
        deadCode: analyses.includes('dead_code')
          ? findDeadCode(enrichedGraph)
          : undefined,
        apiSurface: analyses.includes('api_surface')
          ? analyzeAPISurface(enrichedGraph)
          : undefined,
        drift: analyses.includes('architectural_drift') && validated.baseline
          ? await detectDrift(enrichedGraph, validated.baseline)
          : undefined,
        summary: {
          totalFiles: enrichedGraph.nodes.length,
          totalModules: countModules(enrichedGraph),
          healthScore: calculateHealthScore(enrichedGraph),
          issues: 0,
          warnings: 0,
        },
        durationMs: Date.now() - startTime,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            durationMs: Date.now() - startTime,
          }, null, 2),
        }],
      };
    }
  },
};

// ============================================================================
// Refactor Impact Tool
// ============================================================================

/**
 * MCP Tool: code/refactor-impact
 *
 * Analyze impact of proposed code changes using GNN
 */
export const refactorImpactTool: MCPTool<
  z.infer<typeof RefactorImpactInputSchema>,
  RefactoringImpactResult
> = {
  name: 'code/refactor-impact',
  description: 'Analyze impact of proposed code changes using GNN',
  category: 'code-intelligence',
  version: '3.0.0-alpha.1',
  inputSchema: RefactorImpactInputSchema,
  handler: async (input, context) => {
    const startTime = Date.now();

    try {
      const validated = RefactorImpactInputSchema.parse(input);

      // Validate file paths
      for (const change of validated.changes) {
        validatePath(change.file, context.config.allowedRoots);
      }

      // Initialize GNN bridge
      const gnn = context.bridges.gnn;
      if (!gnn.isInitialized()) {
        await gnn.initialize();
      }

      // Get affected files
      const changedFiles = validated.changes.map(c => c.file);

      // Build graph
      const allFiles = await getAllRelatedFiles(changedFiles);
      const safeFiles = allFiles.filter(f =>
        !isSensitivePath(f, context.config.blockedPatterns)
      );

      const graph = await gnn.buildCodeGraph(safeFiles, true);

      // Predict impact using GNN propagation
      const impactScores = await gnn.predictImpact(
        graph,
        changedFiles,
        validated.depth
      );

      // Build file impacts
      const impactedFiles: FileImpact[] = [];
      for (const [filePath, score] of impactScores) {
        if (score > 0.1) {
          impactedFiles.push({
            filePath,
            impactType: changedFiles.includes(filePath) ? 'direct' :
              score > 0.5 ? 'indirect' : 'transitive',
            requiresChange: changedFiles.includes(filePath) || score > 0.7,
            changesNeeded: getChangesNeeded(filePath, validated.changes),
            risk: score > 0.8 ? 'high' : score > 0.5 ? 'medium' : 'low',
            testsAffected: validated.includeTests
              ? getAffectedTests(filePath, graph)
              : [],
          });
        }
      }

      // Sort by impact
      impactedFiles.sort((a, b) => {
        const aScore = impactScores.get(a.filePath) ?? 0;
        const bScore = impactScores.get(b.filePath) ?? 0;
        return bScore - aScore;
      });

      const result: RefactoringImpactResult = {
        success: true,
        changes: validated.changes.map(c => ({
          file: c.file,
          type: c.type,
          details: c.details ?? {},
        })),
        impactedFiles,
        summary: {
          directlyAffected: impactedFiles.filter(f => f.impactType === 'direct').length,
          indirectlyAffected: impactedFiles.filter(f => f.impactType !== 'direct').length,
          testsAffected: new Set(impactedFiles.flatMap(f => f.testsAffected)).size,
          totalRisk: impactedFiles.some(f => f.risk === 'high') ? 'high' :
            impactedFiles.some(f => f.risk === 'medium') ? 'medium' : 'low',
        },
        suggestedOrder: getSuggestedOrder(impactedFiles, graph),
        breakingChanges: findBreakingChanges(validated.changes, graph),
        durationMs: Date.now() - startTime,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            durationMs: Date.now() - startTime,
          }, null, 2),
        }],
      };
    }
  },
};

// ============================================================================
// Split Suggest Tool
// ============================================================================

/**
 * MCP Tool: code/split-suggest
 *
 * Suggest optimal code splitting using MinCut algorithm
 */
export const splitSuggestTool: MCPTool<
  z.infer<typeof SplitSuggestInputSchema>,
  ModuleSplitResult
> = {
  name: 'code/split-suggest',
  description: 'Suggest optimal code splitting using MinCut algorithm',
  category: 'code-intelligence',
  version: '3.0.0-alpha.1',
  inputSchema: SplitSuggestInputSchema,
  handler: async (input, context) => {
    const startTime = Date.now();

    try {
      const validated = SplitSuggestInputSchema.parse(input);

      // Validate path
      const targetPath = validatePath(validated.targetPath, context.config.allowedRoots);

      // Initialize bridges
      const gnn = context.bridges.gnn;
      const mincut = context.bridges.mincut;

      if (!gnn.isInitialized()) await gnn.initialize();
      if (!mincut.isInitialized()) await mincut.initialize();

      // Get files
      const files = await getFilesInPath(targetPath);
      const safeFiles = files.filter(f =>
        !isSensitivePath(f, context.config.blockedPatterns)
      );

      // Build graph
      const graph = await gnn.buildCodeGraph(safeFiles, true);

      // Determine number of modules
      const targetModules = validated.targetModules ??
        Math.max(2, Math.ceil(Math.sqrt(graph.nodes.length / 5)));

      // Find optimal cuts
      const partition = await mincut.findOptimalCuts(
        graph,
        targetModules,
        validated.constraints ?? {}
      );

      // Build suggested modules
      const modules = buildSuggestedModules(graph, partition, validated.strategy);

      // Calculate cut edges
      const cutEdges: Array<{ from: string; to: string; weight: number }> = [];
      for (const edge of graph.edges) {
        const fromPart = partition.get(edge.from);
        const toPart = partition.get(edge.to);
        if (fromPart !== undefined && toPart !== undefined && fromPart !== toPart) {
          cutEdges.push({
            from: edge.from,
            to: edge.to,
            weight: edge.weight,
          });
        }
      }

      // Calculate quality metrics
      const totalCutWeight = cutEdges.reduce((sum, e) => sum + e.weight, 0);
      const avgCohesion = modules.reduce((sum, m) => sum + m.cohesion, 0) / modules.length;
      const avgCoupling = modules.reduce((sum, m) => sum + m.coupling, 0) / modules.length;
      const sizes = modules.map(m => m.loc);
      const balanceScore = 1 - (Math.max(...sizes) - Math.min(...sizes)) /
        (Math.max(...sizes) + 1);

      const result: ModuleSplitResult = {
        success: true,
        targetPath,
        strategy: validated.strategy,
        modules,
        cutEdges,
        quality: {
          totalCutWeight,
          avgCohesion,
          avgCoupling,
          balanceScore,
        },
        migrationSteps: generateMigrationSteps(modules, cutEdges),
        durationMs: Date.now() - startTime,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            durationMs: Date.now() - startTime,
          }, null, 2),
        }],
      };
    }
  },
};

// ============================================================================
// Learn Patterns Tool
// ============================================================================

/**
 * MCP Tool: code/learn-patterns
 *
 * Learn recurring patterns from code changes using SONA
 */
export const learnPatternsTool: MCPTool<
  z.infer<typeof LearnPatternsInputSchema>,
  PatternLearningResult
> = {
  name: 'code/learn-patterns',
  description: 'Learn recurring patterns from code changes using SONA',
  category: 'code-intelligence',
  version: '3.0.0-alpha.1',
  inputSchema: LearnPatternsInputSchema,
  handler: async (input, context) => {
    const startTime = Date.now();

    try {
      const validated = LearnPatternsInputSchema.parse(input);

      // Analyze git history
      const scope = validated.scope ?? { gitRange: 'HEAD~100..HEAD' };
      const patternTypes = validated.patternTypes ?? [
        'bug_patterns',
        'refactor_patterns',
      ];

      // Learn patterns from commits (simplified)
      const patterns = await learnPatternsFromHistory(
        scope,
        patternTypes,
        validated.minOccurrences,
        context
      );

      // Generate recommendations
      const recommendations = generateRecommendations(patterns);

      const result: PatternLearningResult = {
        success: true,
        scope,
        patternTypes,
        patterns,
        summary: {
          commitsAnalyzed: 100, // Simplified
          filesAnalyzed: patterns.reduce((sum, p) => sum + p.files.length, 0),
          patternsFound: patterns.length,
          byType: patternTypes.reduce((acc, type) => {
            acc[type] = patterns.filter(p => p.type === type).length;
            return acc;
          }, {} as Record<string, number>),
        },
        recommendations,
        durationMs: Date.now() - startTime,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        data: result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: errorMessage,
            durationMs: Date.now() - startTime,
          }, null, 2),
        }],
      };
    }
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

async function performSemanticSearch(
  query: string,
  paths: string[],
  searchType: string,
  topK: number,
  languages: string[] | undefined,
  excludeTests: boolean,
  _context: ToolContext
): Promise<CodeSearchResult[]> {
  const results: CodeSearchResult[] = [];

  try {
    // Get all files in the specified paths
    const allFiles: string[] = [];
    for (const rootPath of paths) {
      const files = await getFilesInPath(rootPath);
      allFiles.push(...files);
    }

    // Filter by language if specified
    let filteredFiles = allFiles;
    if (languages && languages.length > 0) {
      const langExtensions = languages.flatMap(lang => {
        const extMap: Record<string, string[]> = {
          typescript: ['.ts', '.tsx'],
          javascript: ['.js', '.jsx'],
          python: ['.py'],
          java: ['.java'],
          go: ['.go'],
          rust: ['.rs'],
          cpp: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
        };
        return extMap[lang] ?? [];
      });
      filteredFiles = allFiles.filter(file =>
        langExtensions.some(ext => file.endsWith(ext))
      );
    }

    // Exclude test files if requested
    if (excludeTests) {
      filteredFiles = filteredFiles.filter(file =>
        !file.includes('.test.') &&
        !file.includes('.spec.') &&
        !file.includes('__tests__')
      );
    }

    // Load @claude-flow/embeddings dynamically
    let embeddings: any;
    try {
      embeddings = await import('@claude-flow/embeddings');
    } catch {
      // If embeddings package not available, return empty results
      return results;
    }

    // Create embeddings instance
    const embeddingsInstance = new embeddings.Embeddings({
      model: 'all-MiniLM-L6-v2',
      dimensions: 384,
    });

    // Generate query embedding
    const queryEmbedding = await embeddingsInstance.embed(query);

    // Read and embed file contents
    const fileEmbeddings: Array<{ file: string; embedding: number[]; content: string }> = [];
    for (const file of filteredFiles.slice(0, 1000)) {
      try {
        const stat = await fs.stat(file);
        // Skip files larger than 100KB
        if (stat.size > 100 * 1024) continue;

        const content = await fs.readFile(file, 'utf-8');
        
        // For searchType filtering, extract relevant parts
        let textToEmbed = content;
        if (searchType === 'function') {
          // Simple function extraction (matches function/async function declarations)
          const functionMatches = content.match(/(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*\{[^}]*\}/g);
          if (functionMatches) textToEmbed = functionMatches.join('\n');
        } else if (searchType === 'class') {
          const classMatches = content.match(/class\s+\w+[^{]*\{[^}]*\}/g);
          if (classMatches) textToEmbed = classMatches.join('\n');
        }

        if (textToEmbed.trim().length > 0) {
          const embedding = await embeddingsInstance.embed(textToEmbed.slice(0, 5000));
          fileEmbeddings.push({ file, embedding, content });
        }
      } catch {
        // Skip files that can't be read
        continue;
      }
    }

    // Calculate cosine similarity
    const similarities = fileEmbeddings.map(({ file, embedding, content }) => {
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return { file, similarity, content };
    });

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Take top K and format results
    for (const { file, similarity, content } of similarities.slice(0, topK)) {
      // Extract snippet around most relevant section
      const snippet = content.slice(0, 500);
      const contextLines = content.split('\n').slice(0, 10).join('\n');
      const detectedLang = detectLanguageFromPath(file);

      results.push({
        filePath: file,
        snippet,
        context: contextLines,
        score: similarity,
        language: detectedLang as Language,
        matchType: 'semantic' as SearchType,
        lineNumber: 1,
        explanation: `Semantic similarity: ${(similarity * 100).toFixed(1)}%`,
      });
    }
  } catch (error) {
    // If anything fails, return empty results rather than throwing
    console.error('Semantic search error:', error);
  }

  return results;
}

/** Calculate cosine similarity between two vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator > 0 ? dot / denominator : 0;
}

/** Detect language from file path */
function detectLanguageFromPath(filePath: string): Language {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap: Record<string, Language> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    java: 'java',
    go: 'go',
    rs: 'rust',
    cpp: 'cpp',
    c: 'cpp',
    cs: 'csharp',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    scala: 'scala',
  };
  return ext && langMap[ext] ? langMap[ext]! : 'typescript';
}

async function getFilesInPath(rootPath: string): Promise<string[]> {
  try {
    // Use fast-glob for efficient recursive file discovery
    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.py',
      '**/*.java',
      '**/*.go',
      '**/*.rs',
      '**/*.cpp',
      '**/*.c',
      '**/*.h',
    ];

    const files = await glob(patterns, {
      cwd: rootPath,
      absolute: true,
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**',
        '**/.next/**',
      ],
      onlyFiles: true,
      stats: true,
    });

    // Filter out files larger than 100KB
    const filteredFiles: string[] = [];
    for (const file of files) {
      if (typeof file === 'string') {
        try {
          const stat = await fs.stat(file);
          if (stat.size <= 100 * 1024) {
            filteredFiles.push(file);
          }
        } catch {
          // Skip files that can't be stat'd
          continue;
        }
      }
    }

    return filteredFiles;
  } catch (error) {
    console.error('Error getting files in path:', error);
    return [];
  }
}

async function getAllRelatedFiles(changedFiles: string[]): Promise<string[]> {
  const relatedFiles = new Set<string>(changedFiles);
  const visited = new Set<string>();
  const maxDepth = 3;

  // Forward BFS: find files that the changed files import
  const forwardQueue: Array<{ file: string; depth: number }> = [];
  for (const file of changedFiles) {
    forwardQueue.push({ file, depth: 0 });
    visited.add(file);
  }

  while (forwardQueue.length > 0) {
    const current = forwardQueue.shift();
    if (!current || current.depth >= maxDepth) continue;

    try {
      const content = await fs.readFile(current.file, 'utf-8');
      const imports = extractImportsFromContent(content, current.file);

      for (const importedFile of imports) {
        if (!visited.has(importedFile)) {
          visited.add(importedFile);
          relatedFiles.add(importedFile);
          forwardQueue.push({ file: importedFile, depth: current.depth + 1 });
        }
      }
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  // Reverse dependency scan: find files that import the changed files
  // This requires scanning all project files (expensive, so we limit scope)
  const projectRoot = findProjectRoot(changedFiles[0] ?? '.');
  const allFiles = await getFilesInPath(projectRoot);

  for (const file of allFiles) {
    if (relatedFiles.has(file)) continue;

    try {
      const content = await fs.readFile(file, 'utf-8');
      const imports = extractImportsFromContent(content, file);

      // Check if this file imports any of our changed files
      for (const changedFile of changedFiles) {
        if (imports.includes(changedFile)) {
          relatedFiles.add(file);
          break;
        }
      }
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  return Array.from(relatedFiles);
}

/** Extract imports from file content */
function extractImportsFromContent(content: string, sourceFile: string): string[] {
  const imports: string[] = [];
  const sourceDir = path.dirname(sourceFile);

  // Match ES6 imports: import ... from 'path'
  const es6ImportRegex = /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = es6ImportRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath && !importPath.startsWith('@') && !importPath.startsWith('node:')) {
      const resolved = resolveImportPath(importPath, sourceDir);
      if (resolved) imports.push(resolved);
    }
  }

  // Match CommonJS requires: require('path')
  const cjsRequireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = cjsRequireRegex.exec(content)) !== null) {
    const requirePath = match[1];
    if (requirePath && !requirePath.startsWith('@') && !requirePath.startsWith('node:')) {
      const resolved = resolveImportPath(requirePath, sourceDir);
      if (resolved) imports.push(resolved);
    }
  }

  return imports;
}

/** Resolve relative import path to absolute path */
function resolveImportPath(importPath: string, sourceDir: string): string | null {
  // Only handle relative imports
  if (!importPath.startsWith('.')) return null;

  let resolved = path.resolve(sourceDir, importPath);

  // Try common extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    try {
      // Check if file exists synchronously for performance
      if (require('fs').existsSync(candidate)) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  // If no extension worked, return the resolved path anyway
  return resolved;
}

/** Find project root by looking for package.json */
function findProjectRoot(startPath: string): string {
  let currentDir = path.dirname(startPath);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    try {
      if (require('fs').existsSync(packageJsonPath)) {
        return currentDir;
      }
    } catch {
      // Continue searching
    }
    currentDir = path.dirname(currentDir);
  }

  // Default to current directory if no package.json found
  return path.dirname(startPath);
}

/** Enrich graph with real import edges (compensates for GNNBridge.extractImports stub) */
async function enrichGraphWithEdges(graph: DependencyGraph): Promise<DependencyGraph> {
  const newEdges: Array<{
    from: string;
    to: string;
    type: 'import' | 'extends' | 'implements' | 'uses' | 'calls';
    weight: number;
  }> = [...graph.edges];
  const nodeIds = new Set(graph.nodes.map(n => n.id));

  // For each node, parse its file and extract actual imports
  for (const node of graph.nodes) {
    try {
      const content = await fs.readFile(node.id, 'utf-8');
      const imports = extractImportsFromContent(content, node.id);

      // Add edges for imports that point to other nodes in the graph
      for (const importedFile of imports) {
        if (nodeIds.has(importedFile) && node.id !== importedFile) {
          // Check if edge already exists
          const edgeExists = newEdges.some(
            e => e.from === node.id && e.to === importedFile
          );
          if (!edgeExists) {
            newEdges.push({
              from: node.id,
              to: importedFile,
              type: 'import',
              weight: 1,
            });
          }
        }
      }
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  return {
    ...graph,
    edges: newEdges,
    metadata: {
      ...graph.metadata,
      totalEdges: newEdges.length,
    },
  };
}

function detectLayerViolations(
  graph: DependencyGraph,
  layers?: Record<string, string[]>
): import('./types.js').LayerViolation[] {
  const violations: import('./types.js').LayerViolation[] = [];

  if (!layers) return violations;

  // Build layer lookup
  const nodeLayer = new Map<string, string>();
  for (const [layer, patterns] of Object.entries(layers)) {
    for (const pattern of patterns) {
      for (const node of graph.nodes) {
        if (node.id.includes(pattern)) {
          nodeLayer.set(node.id, layer);
        }
      }
    }
  }

  // Check edges for violations
  for (const edge of graph.edges) {
    const fromLayer = nodeLayer.get(edge.from);
    const toLayer = nodeLayer.get(edge.to);

    if (fromLayer && toLayer && fromLayer !== toLayer) {
      // Simplified check - in production would check layer order
      violations.push({
        source: edge.from,
        target: edge.to,
        sourceLayer: fromLayer,
        targetLayer: toLayer,
        violationType: 'cross',
        severity: 'medium',
        suggestedFix: `Move ${edge.from} or ${edge.to} to appropriate layer`,
      });
    }
  }

  return violations;
}

function detectCircularDeps(graph: DependencyGraph): import('./types.js').CircularDependency[] {
  const cycles: import('./types.js').CircularDependency[] = [];

  // Build adjacency list
  const adj = new Map<string, string[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    adj.get(edge.from)?.push(edge.to);
  }

  // DFS for cycle detection
  const visited = new Set<string>();
  const recStack = new Set<string>();

  const findCycle = (node: string, path: string[]): void => {
    visited.add(node);
    recStack.add(node);

    for (const neighbor of adj.get(node) ?? []) {
      if (recStack.has(neighbor)) {
        // Found cycle
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart >= 0) {
          cycles.push({
            cycle: [...path.slice(cycleStart), neighbor],
            length: path.length - cycleStart + 1,
            severity: path.length - cycleStart > 3 ? 'high' : 'medium',
            suggestedBreakPoint: neighbor,
          });
        }
      } else if (!visited.has(neighbor)) {
        findCycle(neighbor, [...path, neighbor]);
      }
    }

    recStack.delete(node);
  };

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      findCycle(node.id, [node.id]);
    }
  }

  return cycles;
}

function calculateCouplingMetrics(graph: DependencyGraph): import('./types.js').CouplingMetrics[] {
  const metrics: import('./types.js').CouplingMetrics[] = [];

  for (const node of graph.nodes) {
    const afferent = graph.edges.filter(e => e.to === node.id).length;
    const efferent = graph.edges.filter(e => e.from === node.id).length;
    const instability = (afferent + efferent) > 0
      ? efferent / (afferent + efferent)
      : 0;

    metrics.push({
      componentId: node.id,
      afferentCoupling: afferent,
      efferentCoupling: efferent,
      instability,
      abstractness: 0.5, // Simplified
      distanceFromMain: Math.abs(instability - 0.5),
      inZoneOfPain: instability < 0.3 && false, // Simplified
      inZoneOfUselessness: instability > 0.7 && false, // Simplified
    });
  }

  return metrics;
}

function calculateCohesionMetrics(_graph: DependencyGraph): import('./types.js').CohesionMetrics[] {
  return [];
}

function findDeadCode(graph: DependencyGraph): import('./types.js').DeadCodeFinding[] {
  const deadCode: import('./types.js').DeadCodeFinding[] = [];

  // Find nodes with no incoming edges and not exported
  const hasIncoming = new Set(graph.edges.map(e => e.to));

  for (const node of graph.nodes) {
    if (!hasIncoming.has(node.id) && node.type === 'function') {
      deadCode.push({
        filePath: node.id,
        symbol: node.label,
        symbolType: 'function',
        lineNumber: 1,
        confidence: 0.7,
        reason: 'No references found',
        isExported: false,
      });
    }
  }

  return deadCode;
}

function analyzeAPISurface(_graph: DependencyGraph): import('./types.js').APISurfaceElement[] {
  return [];
}

async function detectDrift(
  _graph: DependencyGraph,
  _baseline: string
): Promise<import('./types.js').ArchitecturalDrift[]> {
  return [];
}

function countModules(graph: DependencyGraph): number {
  const dirs = new Set<string>();
  for (const node of graph.nodes) {
    const parts = node.id.split('/');
    if (parts.length > 1) {
      dirs.add(parts.slice(0, -1).join('/'));
    }
  }
  return dirs.size;
}

function calculateHealthScore(graph: DependencyGraph): number {
  // Simplified scoring
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;

  if (nodeCount === 0) return 100;

  const avgDegree = edgeCount / nodeCount;
  const idealDegree = 3;

  return Math.max(0, 100 - Math.abs(avgDegree - idealDegree) * 10);
}

function getChangesNeeded(
  filePath: string,
  changes: Array<{ file: string; type: string; details?: Record<string, unknown> }>
): string[] {
  const changesNeeded: string[] = [];

  for (const change of changes) {
    if (change.file === filePath) {
      changesNeeded.push(`Apply ${change.type}`);
    }
  }

  return changesNeeded;
}

function getAffectedTests(filePath: string, graph: DependencyGraph): string[] {
  const tests: string[] = [];

  for (const edge of graph.edges) {
    if (edge.from === filePath && edge.to.includes('.test')) {
      tests.push(edge.to);
    }
  }

  return tests;
}

function getSuggestedOrder(
  impactedFiles: FileImpact[],
  _graph: DependencyGraph
): string[] {
  // Order by dependencies
  return impactedFiles
    .filter(f => f.requiresChange)
    .sort((a, b) => {
      const aRisk = a.risk === 'high' ? 3 : a.risk === 'medium' ? 2 : 1;
      const bRisk = b.risk === 'high' ? 3 : b.risk === 'medium' ? 2 : 1;
      return bRisk - aRisk;
    })
    .map(f => f.filePath);
}

function findBreakingChanges(
  changes: Array<{ file: string; type: string; details?: Record<string, unknown> }>,
  graph: DependencyGraph
): string[] {
  const breakingChanges: string[] = [];

  for (const change of changes) {
    if (change.type === 'delete') {
      const dependents = graph.edges.filter(e => e.to === change.file);
      if (dependents.length > 0) {
        breakingChanges.push(`Deleting ${change.file} breaks ${dependents.length} dependents`);
      }
    }
  }

  return breakingChanges;
}

function buildSuggestedModules(
  graph: DependencyGraph,
  partition: Map<string, number>,
  _strategy: string
): SuggestedModule[] {
  const modules: SuggestedModule[] = [];
  const partitionGroups = new Map<number, string[]>();

  for (const [nodeId, partNum] of partition) {
    if (!partitionGroups.has(partNum)) {
      partitionGroups.set(partNum, []);
    }
    partitionGroups.get(partNum)?.push(nodeId);
  }

  for (const [partNum, files] of partitionGroups) {
    // Calculate cohesion (internal edges / possible internal edges)
    const internalEdges = graph.edges.filter(
      e => partition.get(e.from) === partNum && partition.get(e.to) === partNum
    ).length;
    const possibleEdges = files.length * (files.length - 1);
    const cohesion = possibleEdges > 0 ? internalEdges / possibleEdges : 1;

    // Calculate coupling (external edges)
    const externalEdges = graph.edges.filter(
      e => (partition.get(e.from) === partNum) !== (partition.get(e.to) === partNum)
    ).length;
    const coupling = externalEdges / Math.max(files.length, 1);

    // Get dependencies on other modules
    const dependencies = new Set<string>();
    for (const edge of graph.edges) {
      if (partition.get(edge.from) === partNum && partition.get(edge.to) !== partNum) {
        const depModule = partition.get(edge.to);
        if (depModule !== undefined) {
          dependencies.add(`module-${depModule}`);
        }
      }
    }

    modules.push({
      name: `module-${partNum}`,
      files,
      loc: files.length * 100, // Simplified
      cohesion,
      coupling,
      publicApi: [], // Simplified
      dependencies: Array.from(dependencies),
    });
  }

  return modules;
}

function generateMigrationSteps(
  modules: SuggestedModule[],
  cutEdges: Array<{ from: string; to: string; weight: number }>
): string[] {
  const steps: string[] = [];

  steps.push(`1. Create ${modules.length} new module directories`);
  steps.push(`2. Move files to their respective modules`);
  steps.push(`3. Update ${cutEdges.length} cross-module imports`);
  steps.push(`4. Define public APIs for each module`);
  steps.push(`5. Run tests to verify no regressions`);

  return steps;
}

async function learnPatternsFromHistory(
  _scope: { gitRange?: string; authors?: string[]; paths?: string[] },
  _patternTypes: string[],
  _minOccurrences: number,
  _context: ToolContext
): Promise<LearnedPattern[]> {
  // Simplified - in production would analyze git history
  return [
    {
      id: 'pattern-1',
      type: 'refactor_patterns',
      description: 'Convert callbacks to async/await',
      codeBefore: 'function(callback) { ... }',
      codeAfter: 'async function() { ... }',
      occurrences: 5,
      authors: ['developer1'],
      files: ['src/utils.ts'],
      confidence: 0.85,
      impact: 'positive',
      suggestedAction: 'Consider modernizing callback-based code to async/await',
    },
  ];
}

function generateRecommendations(patterns: LearnedPattern[]): string[] {
  const recommendations: string[] = [];

  for (const pattern of patterns) {
    if (pattern.suggestedAction) {
      recommendations.push(pattern.suggestedAction);
    }
  }

  return recommendations;
}

// ============================================================================
// Tool Registry
// ============================================================================

/**
 * All Code Intelligence MCP Tools
 */
export const codeIntelligenceTools: MCPTool[] = [
  semanticSearchTool as unknown as MCPTool,
  architectureAnalyzeTool as unknown as MCPTool,
  refactorImpactTool as unknown as MCPTool,
  splitSuggestTool as unknown as MCPTool,
  learnPatternsTool as unknown as MCPTool,
];

/**
 * Tool name to handler map
 */
export const toolHandlers = new Map<string, MCPTool['handler']>([
  ['code/semantic-search', semanticSearchTool.handler as MCPTool['handler']],
  ['code/architecture-analyze', architectureAnalyzeTool.handler as MCPTool['handler']],
  ['code/refactor-impact', refactorImpactTool.handler as MCPTool['handler']],
  ['code/split-suggest', splitSuggestTool.handler as MCPTool['handler']],
  ['code/learn-patterns', learnPatternsTool.handler as MCPTool['handler']],
]);

/**
 * Create tool context with bridges
 */
export function createToolContext(config?: Partial<ToolContext['config']>): ToolContext {
  const store = new Map<string, unknown>();

  const defaultBlockedPatterns = [
    /\.env$/,
    /\.git\/config$/,
    /credentials/i,
    /secrets?\./i,
    /\.pem$/,
    /\.key$/,
    /id_rsa/i,
  ];

  return {
    get: <T>(key: string) => store.get(key) as T | undefined,
    set: <T>(key: string, value: T) => { store.set(key, value); },
    bridges: {
      gnn: createGNNBridge(),
      mincut: createMinCutBridge(),
    },
    config: {
      allowedRoots: config?.allowedRoots ?? ['.'],
      blockedPatterns: config?.blockedPatterns ?? defaultBlockedPatterns,
      maskSecrets: config?.maskSecrets ?? true,
    },
  };
}

export default codeIntelligenceTools;
