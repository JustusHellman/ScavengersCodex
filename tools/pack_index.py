#!/usr/bin/env python3
"""Rebuild homebrew/index.json from the pack files in homebrew/.
The website reads that index to know which packs exist. The GitHub deploy workflow runs this on
every push, so adding a pack is just dropping its .json file into homebrew/.
Usage: python3 tools/pack_index.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import codexdata

if __name__ == "__main__":
    for e in codexdata.write_index():
        print(f"{'on ' if e['default'] else 'off'}  {e['title']}  ({e['file']})")
