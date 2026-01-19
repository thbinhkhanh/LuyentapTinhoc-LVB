import React from "react";
import {
  Box,
  Divider,
  Typography,
  Stack,
  Paper,
  Radio,
  Checkbox,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";

/**
 * Component render 1 câu hỏi
 */
const QuestionRenderer = ({
  DragDropContext,
  Droppable,
  Draggable,

  loading,
  currentQuestion,
  currentIndex,
  answers,
  setAnswers,
  started,
  submitted,
  choXemDapAn,
  handleSingleSelect,
  handleMultipleSelect,
  handleDragEnd,
  reorder,
  normalizeValue,
  setZoomImage,
}) => {

  if (loading || !currentQuestion) return null;

  return (
    <Box key={currentQuestion.id || currentIndex}>
      <Divider sx={{ my: 2 }} />

      {/* =================== TIÊU ĐỀ CÂU HỎI =================== */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        <strong>Câu {currentIndex + 1}:</strong>{" "}
        <span
          dangerouslySetInnerHTML={{
            __html: (currentQuestion.question || "").replace(/^<p>|<\/p>$/g, "")
          }}
        />
      </Typography>

      {/* =================== HÌNH CHUNG =================== */}
      {currentQuestion.image && (
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src={currentQuestion.image}
            alt="question"
            style={{
              maxWidth: "100%",
              maxHeight: 150,
              objectFit: "contain",
              borderRadius: 8
            }}
          />
        </Box>
      )}

      {/* =================== SORT =================== */}
      {currentQuestion.type === "sort" && (
        <DragDropContext
          onDragEnd={(result) => {
            if (!result.destination || submitted || !started) return;

            const currentOrder =
              answers[currentQuestion.id] ??
              currentQuestion.options.map((_, idx) => idx);

            const newOrder = reorder(
              currentOrder,
              result.source.index,
              result.destination.index
            );

            setAnswers((prev) => ({
              ...prev,
              [currentQuestion.id]: newOrder
            }));
          }}
        >
          <Droppable droppableId="sort-options">
            {(provided) => {
              const orderIdx =
                answers[currentQuestion.id] ??
                currentQuestion.options.map((_, idx) => idx);

              return (
                <Stack
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  spacing={2}
                >
                  {orderIdx.map((optIdx, pos) => {
                    const optionData = currentQuestion.options[optIdx];
                    const optionText =
                      typeof optionData === "string"
                        ? optionData
                        : optionData.text ?? "";
                    const optionImage =
                      typeof optionData === "object"
                        ? optionData.image ?? null
                        : null;

                    const correctData =
                      currentQuestion.correctTexts?.[pos];
                    const isCorrectPos =
                      submitted &&
                      choXemDapAn &&
                      normalizeValue(optionData) ===
                        normalizeValue(correctData);

                    return (
                      <Draggable
                        key={optIdx}
                        draggableId={String(optIdx)}
                        index={pos}
                        isDragDisabled={submitted || !started}
                      >
                        {(prov) => (
                          <Box
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            sx={{
                              borderRadius: 1,
                              border: "1px solid #90caf9",
                              px: 1,
                              py: 0.5,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              bgcolor:
                                submitted && choXemDapAn
                                  ? isCorrectPos
                                    ? "#c8e6c9"
                                    : "#ffcdd2"
                                  : "transparent"
                            }}
                          >
                            {optionImage && (
                              <img
                                src={optionImage}
                                alt=""
                                style={{
                                  maxHeight: 40,
                                  objectFit: "contain"
                                }}
                              />
                            )}

                            <Typography
                              component="div"
                              sx={{ flex: 1 }}
                              dangerouslySetInnerHTML={{
                                __html: optionText
                              }}
                            />
                          </Box>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </Stack>
              );
            }}
          </Droppable>
        </DragDropContext>
      )}

      {/* =================== SINGLE =================== */}
      {currentQuestion.type === "single" && (
        <Stack spacing={2}>
          {currentQuestion.displayOrder.map((optIdx) => {
            const selected = answers[currentQuestion.id] === optIdx;

            const optionData = currentQuestion.options[optIdx];
            const optionText =
              typeof optionData === "object"
                ? optionData.text ?? ""
                : optionData;

            return (
              <Paper
                key={optIdx}
                onClick={() =>
                  !submitted &&
                  started &&
                  handleSingleSelect(currentQuestion.id, optIdx)
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  py: 0.5,
                  border: "1px solid #90caf9",
                  cursor:
                    submitted || !started ? "default" : "pointer"
                }}
              >
                <Radio checked={selected} />
                <Typography
                  component="div"
                  dangerouslySetInnerHTML={{ __html: optionText }}
                />
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* =================== MULTIPLE =================== */}
      {currentQuestion.type === "multiple" && (
        <Stack spacing={2}>
          {currentQuestion.displayOrder.map((optIdx) => {
            const userAns = answers[currentQuestion.id] || [];
            const checked = userAns.includes(optIdx);
            const option = currentQuestion.options[optIdx];

            return (
              <Paper
                key={optIdx}
                onClick={() =>
                  !submitted &&
                  started &&
                  handleMultipleSelect(
                    currentQuestion.id,
                    optIdx,
                    !checked
                  )
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  py: 0.5,
                  border: "1px solid #90caf9"
                }}
              >
                <Checkbox checked={checked} />
                <Typography
                  component="div"
                  dangerouslySetInnerHTML={{
                    __html: option.text ?? option
                  }}
                />
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* =================== TRUE / FALSE =================== */}
      {currentQuestion.type === "truefalse" && (
        <Stack spacing={2}>
          {currentQuestion.options.map((opt, i) => {
            const userAns = answers[currentQuestion.id] || [];
            const selected = userAns[i] ?? "";

            return (
              <Paper
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  py: 0.5,
                  border: "1px solid #90caf9"
                }}
              >
                <Typography
                  component="div"
                  dangerouslySetInnerHTML={{ __html: opt }}
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ width: 90 }}>
                  <Select
                    value={selected}
                    onChange={(e) => {
                      if (submitted || !started) return;
                      const val = e.target.value;
                      setAnswers((prev) => {
                        const arr = Array.isArray(prev[currentQuestion.id])
                          ? [...prev[currentQuestion.id]]
                          : [];
                        arr[i] = val;
                        return {
                          ...prev,
                          [currentQuestion.id]: arr
                        };
                      });
                    }}
                  >
                    <MenuItem value="Đ">Đúng</MenuItem>
                    <MenuItem value="S">Sai</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default QuestionRenderer;
