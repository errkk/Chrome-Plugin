#!/bin/bash

while inotifywait -e attrib next.txt;
do
        qdbus org.mpris.MediaPlayer2.spotify / org.freedesktop.MediaPlayer2.Next
done
