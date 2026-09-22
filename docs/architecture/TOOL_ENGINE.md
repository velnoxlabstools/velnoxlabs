# Tool Engine Guide

Layers:
1. Configuration — single config file path to registration
2. Registry — metadata, visibility, routes hooks
3. Logic — ToolLogicModule pipeline
4. Runtime — ExecutionPipeline shared by tools
5. UI — Universal tool page + form-engine + interface

Add tools only through configuration + logic; do not copy page files.
