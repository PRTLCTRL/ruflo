import { describe, it, expect } from "vitest";
import { buildToolPreprompt } from "./toolPrompt";
import type { OpenAiTool } from "$lib/server/mcp/tools";

describe("buildToolPreprompt", () => {
	const mockTools: OpenAiTool[] = [
		{
			type: "function" as const,
			function: {
				name: "search",
				description: "Search the web",
				parameters: { type: "object", properties: {} },
			},
		},
		{
			type: "function" as const,
			function: {
				name: "memory_store",
				description: "Store memory",
				parameters: { type: "object", properties: {} },
			},
		},
	];

	describe("normal mode (autopilot=false)", () => {
		it("includes tool names and date", () => {
			const result = buildToolPreprompt(mockTools, false);
			expect(result).toContain("search, memory_store");
			expect(result).toContain("Today's date:");
		});

		it("includes normal mode instructions", () => {
			const result = buildToolPreprompt(mockTools, false);
			expect(result).toContain("Do NOT call a tool unless");
			expect(result).not.toContain("AUTOPILOT MODE");
			expect(result).not.toContain("PLAN-ONLY MODE");
		});
	});

	describe("autopilot mode (autopilot=true)", () => {
		it("includes autopilot instructions when no plan request detected", () => {
			const result = buildToolPreprompt(mockTools, true, "Build a React app");
			expect(result).toContain("AUTOPILOT MODE ENABLED");
			expect(result).toContain("NEVER ask for confirmation");
			expect(result).toContain("NEVER explain what you plan to do");
			expect(result).not.toContain("PLAN-ONLY MODE");
		});

		it("detects plan-only request and overrides autopilot", () => {
			const result = buildToolPreprompt(mockTools, true, "Generate a plan for building a React app");
			expect(result).toContain("PLAN-ONLY MODE DETECTED");
			expect(result).toContain("DO NOT call any tools");
			expect(result).toContain("WAIT for explicit user confirmation");
			expect(result).not.toContain("AUTOPILOT MODE ENABLED");
		});

		it("detects 'create a plan' request", () => {
			const result = buildToolPreprompt(mockTools, true, "Create a plan for the feature");
			expect(result).toContain("PLAN-ONLY MODE");
		});

		it("detects 'plan only' request", () => {
			const result = buildToolPreprompt(mockTools, true, "I need plan only, no execution");
			expect(result).toContain("PLAN-ONLY MODE");
		});

		it("detects 'outline the plan' request", () => {
			const result = buildToolPreprompt(mockTools, true, "Outline the plan first");
			expect(result).toContain("PLAN-ONLY MODE");
		});

		it("detects 'draft a plan' request", () => {
			const result = buildToolPreprompt(mockTools, true, "Draft a plan before implementing");
			expect(result).toContain("PLAN-ONLY MODE");
		});

		it("does not trigger plan mode for unrelated words", () => {
			const result = buildToolPreprompt(
				mockTools,
				true,
				"Implement the airplane feature and handle edge cases"
			);
			expect(result).toContain("AUTOPILOT MODE ENABLED");
			expect(result).not.toContain("PLAN-ONLY MODE");
		});

		it("is case-insensitive", () => {
			const result = buildToolPreprompt(mockTools, true, "GENERATE THE PLAN");
			expect(result).toContain("PLAN-ONLY MODE");
		});
	});

	describe("edge cases", () => {
		it("returns empty string for empty tools array", () => {
			const result = buildToolPreprompt([], true);
			expect(result).toBe("");
		});

		it("handles tools with no function name", () => {
			const invalidTools = [{ type: "function" as const, function: {} }] as OpenAiTool[];
			const result = buildToolPreprompt(invalidTools, true);
			expect(result).toBe("");
		});

		it("handles undefined user message", () => {
			const result = buildToolPreprompt(mockTools, true, undefined);
			expect(result).toContain("AUTOPILOT MODE ENABLED");
			expect(result).not.toContain("PLAN-ONLY MODE");
		});

		it("handles empty user message", () => {
			const result = buildToolPreprompt(mockTools, true, "");
			expect(result).toContain("AUTOPILOT MODE ENABLED");
			expect(result).not.toContain("PLAN-ONLY MODE");
		});
	});

	describe("real-world examples from issue #1694", () => {
		it("detects 'Now generate the full plan' request", () => {
			const result = buildToolPreprompt(
				mockTools,
				true,
				"Now generate the full plan for my e-commerce project"
			);
			expect(result).toContain("PLAN-ONLY MODE");
		});

		it("allows execution when user says 'now implement'", () => {
			const result = buildToolPreprompt(mockTools, true, "Now implement the plan we discussed");
			expect(result).toContain("AUTOPILOT MODE ENABLED");
			expect(result).not.toContain("PLAN-ONLY MODE");
		});
	});
});
