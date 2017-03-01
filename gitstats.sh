#!/bin/bash

REPO_ROOT="$HOME/repos"
TARGET_DIR="$HOME/web/web/static/commit_graphs"

GITHUB_REPOS=("web" "gitstats" "env" "finance" "tldr-web" "tldr" \
    "temporaluuid64" "translator" "labs" "hanja-web" "hanja" "transporter" \
    "docker" "sbb" "better-translator-electron" "sentinal" "secondary-brain" \
    "bnd" "korbit" "winnowing" "spider" "urwid-stackedwidget" "base62" \
    "hallucination" "maintenance" "boilerpipe" "mendel" "scalable-appliance" \
    "clare" "ista520-midterm" "readown" "troll" "nagle" "sbbs3" "sbbs2" \
    "teachourselves" "codegolf" "hongminhee-assistant")
GITLAB_REPOS=("k/k1server" "k/k1eco" "k/k1market" "k/k1server-configs" \
    "docker/k1eco-base" "docker/k1eco-complete" "docker/housekeeper")

pushd $REPO_ROOT/github
for repo in ${GITHUB_REPOS[@]}; do
    if [[ -d $repo ]]; then
        pushd $repo
        git checkout develop
        git pull
        popd
    else
        git clone "https://github.com/suminb/$repo"
    fi
done

pushd $REPO_ROOT/gitlab
for repo in ${GITLAB_REPOS[@]}; do
    if [[ -d $repo ]]; then
        dir=$(basename $repo)
        pushd $dir
        git checkout develop
        git pull
        popd
    else
        git clone "http://git.k.nexon.com/$repo"
    fi
done

gitstats analyze $REPO_ROOT > gitstats.json
for year in $(seq 2009 2017); do
    gitstats generate_graph gitstats.json $year \
        --email suminb@gmail.com \
        --email suminb@nexon.co.kr > $TARGET_DIR/$year.svg
done
