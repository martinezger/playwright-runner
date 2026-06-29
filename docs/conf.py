# Configuration file for the Sphinx documentation builder.

project   = 'Playwright SIDE Runner'
author    = 'playwrightRunner'
copyright = '2026, playwrightRunner'
release   = '1.0.0'

extensions = [
    'myst_parser',
    'sphinx.ext.autosectionlabel',
]

myst_enable_extensions = [
    'colon_fence',
    'deflist',
    'tasklist',
]

source_suffix = {
    '.rst': 'restructuredtext',
    '.md':  'markdown',
}

templates_path   = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']
html_static_path = ['_static']

html_theme   = 'sphinx_rtd_theme'
html_title   = 'Playwright SIDE Runner'
html_logo    = None

html_theme_options = {
    'navigation_depth': 4,
    'collapse_navigation': False,
    'sticky_navigation': True,
    'titles_only': False,
}
